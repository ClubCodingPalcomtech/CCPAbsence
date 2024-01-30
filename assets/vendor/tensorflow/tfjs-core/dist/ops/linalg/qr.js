/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import { ENGINE } from '../../engine';
import { dispose } from '../../globals';
import { assert } from '../../util';
import { clone } from '../clone';
import { concat } from '../concat';
import { div } from '../div';
import { eye } from '../eye';
import { greater } from '../greater';
import { matMul } from '../mat_mul';
import { mul } from '../mul';
import { neg } from '../neg';
import { norm } from '../norm';
import { op } from '../operation';
import { reshape } from '../reshape';
import { slice } from '../slice';
import { stack } from '../stack';
import { sub } from '../sub';
import { tensor2d } from '../tensor2d';
import { transpose } from '../transpose';
import { unstack } from '../unstack';
import { where } from '../where';
/**
 * Compute QR decomposition of m-by-n matrix using Householder transformation.
 *
 * Implementation based on
 *   [http://www.cs.cornell.edu/~bindel/class/cs6210-f09/lec18.pdf]
 * (http://www.cs.cornell.edu/~bindel/class/cs6210-f09/lec18.pdf)
 *
 * ```js
 * const a = tf.tensor2d([[1, 2], [3, 4]]);
 * let [q, r] = tf.linalg.qr(a);
 * console.log('Q');
 * q.print();
 * console.log('R');
 * r.print();
 * console.log('Orthogonalized');
 * q.dot(q.transpose()).print()  // should be nearly the identity matrix.
 * console.log('Reconstructed');
 * q.dot(r).print(); // should be nearly [[1, 2], [3, 4]];
 * ```
 *
 * @param x The `tf.Tensor` to be QR-decomposed. Must have rank >= 2. Suppose
 *   it has the shape `[..., M, N]`.
 * @param fullMatrices An optional boolean parameter. Defaults to `false`.
 *   If `true`, compute full-sized `Q`. If `false` (the default),
 *   compute only the leading N columns of `Q` and `R`.
 * @returns An `Array` of two `tf.Tensor`s: `[Q, R]`. `Q` is a unitary matrix,
 *   i.e., its columns all have unit norm and are mutually orthogonal.
 *   If `M >= N`,
 *     If `fullMatrices` is `false` (default),
 *       - `Q` has a shape of `[..., M, N]`,
 *       - `R` has a shape of `[..., N, N]`.
 *     If `fullMatrices` is `true` (default),
 *       - `Q` has a shape of `[..., M, M]`,
 *       - `R` has a shape of `[..., M, N]`.
 *   If `M < N`,
 *     - `Q` has a shape of `[..., M, M]`,
 *     - `R` has a shape of `[..., M, N]`.
 * @throws If the rank of `x` is less than 2.
 *
 * @doc {heading:'Operations',
 *       subheading:'Linear Algebra',
 *       namespace:'linalg'}
 */
function qr_(x, fullMatrices = false) {
    assert(x.rank >= 2, () => `qr() requires input tensor to have a rank >= 2, but got rank ${x.rank}`);
    if (x.rank === 2) {
        return qr2d(x, fullMatrices);
    }
    else {
        // Rank > 2.
        // TODO(cais): Below we split the input into individual 2D tensors,
        //   perform QR decomposition on them and then stack the results back
        //   together. We should explore whether this can be parallelized.
        const outerDimsProd = x.shape.slice(0, x.shape.length - 2)
            .reduce((value, prev) => value * prev);
        const x2ds = unstack(reshape(x, [
            outerDimsProd, x.shape[x.shape.length - 2],
            x.shape[x.shape.length - 1]
        ]), 0);
        const q2ds = [];
        const r2ds = [];
        x2ds.forEach(x2d => {
            const [q2d, r2d] = qr2d(x2d, fullMatrices);
            q2ds.push(q2d);
            r2ds.push(r2d);
        });
        const q = reshape(stack(q2ds, 0), x.shape);
        const r = reshape(stack(r2ds, 0), x.shape);
        return [q, r];
    }
}
function qr2d(x, fullMatrices = false) {
    return ENGINE.tidy(() => {
        assert(x.shape.length === 2, () => `qr2d() requires a 2D Tensor, but got a ${x.shape.length}D Tensor.`);
        const m = x.shape[0];
        const n = x.shape[1];
        let q = eye(m); // Orthogonal transform so far.
        let r = clone(x); // Transformed matrix so far.
        const one2D = tensor2d([[1]], [1, 1]);
        let w = clone(one2D);
        const iters = m >= n ? n : m;
        for (let j = 0; j < iters; ++j) {
            // This tidy within the for-loop ensures we clean up temporary
            // tensors as soon as they are no longer needed.
            const rTemp = r;
            const wTemp = w;
            const qTemp = q;
            [w, r, q] = ENGINE.tidy(() => {
                // Find H = I - tau * w * w', to put zeros below R(j, j).
                const rjEnd1 = slice(r, [j, j], [m - j, 1]);
                const normX = norm(rjEnd1);
                const rjj = slice(r, [j, j], [1, 1]);
                // The sign() function returns 0 on 0, which causes division by zero.
                const s = where(greater(rjj, 0), tensor2d([[-1]]), tensor2d([[1]]));
                const u1 = sub(rjj, mul(s, normX));
                const wPre = div(rjEnd1, u1);
                if (wPre.shape[0] === 1) {
                    w = clone(one2D);
                }
                else {
                    w = concat([
                        one2D,
                        slice(wPre, [1, 0], [wPre.shape[0] - 1, wPre.shape[1]])
                    ], 0);
                }
                const tau = neg(div(matMul(s, u1), normX));
                // -- R := HR, Q := QH.
                const rjEndAll = slice(r, [j, 0], [m - j, n]);
                const tauTimesW = mul(tau, w);
                const wT = transpose(w);
                if (j === 0) {
                    r = sub(rjEndAll, matMul(tauTimesW, matMul(wT, rjEndAll)));
                }
                else {
                    const rTimesTau = sub(rjEndAll, matMul(tauTimesW, matMul(wT, rjEndAll)));
                    r = concat([slice(r, [0, 0], [j, n]), rTimesTau], 0);
                }
                const tawTimesWT = transpose(tauTimesW);
                const qAllJEnd = slice(q, [0, j], [m, q.shape[1] - j]);
                if (j === 0) {
                    q = sub(qAllJEnd, matMul(matMul(qAllJEnd, w), tawTimesWT));
                }
                else {
                    const qTimesTau = sub(qAllJEnd, matMul(matMul(qAllJEnd, w), tawTimesWT));
                    q = concat([slice(q, [0, 0], [m, j]), qTimesTau], 1);
                }
                return [w, r, q];
            });
            dispose([rTemp, wTemp, qTemp]);
        }
        if (!fullMatrices && m > n) {
            q = slice(q, [0, 0], [m, n]);
            r = slice(r, [0, 0], [n, n]);
        }
        return [q, r];
    });
}
export const qr = /* @__PURE__ */ op({ qr_ });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi90ZmpzLWNvcmUvc3JjL29wcy9saW5hbGcvcXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBQ0gsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUNwQyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXRDLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFFbEMsT0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUMvQixPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ2pDLE9BQU8sRUFBQyxHQUFHLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFDM0IsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUMzQixPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDbEMsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUMzQixPQUFPLEVBQUMsR0FBRyxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBQzNCLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDN0IsT0FBTyxFQUFDLEVBQUUsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUNoQyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sRUFBQyxLQUFLLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDL0IsT0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUMvQixPQUFPLEVBQUMsR0FBRyxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBQzNCLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDckMs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Q0FBQyxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDNUQ7cUJBQU07b0JBQ0wsTUFBTSxTQUFTLEdBQ1gsR0FBRyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMzRCxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUN0RDtnQkFDRCxNQUFNLFVBQVUsR0FBYSxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2xELE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2RCxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ1gsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztpQkFDNUQ7cUJBQU07b0JBQ0wsTUFBTSxTQUFTLEdBQ1gsR0FBRyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO29CQUMzRCxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUN0RDtnQkFDRCxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUNoQztRQUVELElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUMxQixDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDOUI7UUFFRCxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2hCLENBQUMsQ0FBeUIsQ0FBQztBQUM3QixDQUFDO0FBRUQsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLGVBQWUsQ0FBQyxFQUFFLENBQUMsRUFBQyxHQUFHLEVBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMjAgR29vZ2xlIExMQy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuaW1wb3J0IHtFTkdJTkV9IGZyb20gJy4uLy4uL2VuZ2luZSc7XG5pbXBvcnQge2Rpc3Bvc2V9IGZyb20gJy4uLy4uL2dsb2JhbHMnO1xuaW1wb3J0IHtUZW5zb3IsIFRlbnNvcjJEfSBmcm9tICcuLi8uLi90ZW5zb3InO1xuaW1wb3J0IHthc3NlcnR9IGZyb20gJy4uLy4uL3V0aWwnO1xuXG5pbXBvcnQge2Nsb25lfSBmcm9tICcuLi9jbG9uZSc7XG5pbXBvcnQge2NvbmNhdH0gZnJvbSAnLi4vY29uY2F0JztcbmltcG9ydCB7ZGl2fSBmcm9tICcuLi9kaXYnO1xuaW1wb3J0IHtleWV9IGZyb20gJy4uL2V5ZSc7XG5pbXBvcnQge2dyZWF0ZXJ9IGZyb20gJy4uL2dyZWF0ZXInO1xuaW1wb3J0IHttYXRNdWx9IGZyb20gJy4uL21hdF9tdWwnO1xuaW1wb3J0IHttdWx9IGZyb20gJy4uL211bCc7XG5pbXBvcnQge25lZ30gZnJvbSAnLi4vbmVnJztcbmltcG9ydCB7bm9ybX0gZnJvbSAnLi4vbm9ybSc7XG5pbXBvcnQge29wfSBmcm9tICcuLi9vcGVyYXRpb24nO1xuaW1wb3J0IHtyZXNoYXBlfSBmcm9tICcuLi9yZXNoYXBlJztcbmltcG9ydCB7c2xpY2V9IGZyb20gJy4uL3NsaWNlJztcbmltcG9ydCB7c3RhY2t9IGZyb20gJy4uL3N0YWNrJztcbmltcG9ydCB7c3VifSBmcm9tICcuLi9zdWInO1xuaW1wb3J0IHt0ZW5zb3IyZH0gZnJvbSAnLi4vdGVuc29yMmQnO1xuaW1wb3J0IHt0cmFuc3Bvc2V9IGZyb20gJy4uL3RyYW5zcG9zZSc7XG5pbXBvcnQge3Vuc3RhY2t9IGZyb20gJy4uL3Vuc3RhY2snO1xuaW1wb3J0IHt3aGVyZX0gZnJvbSAnLi4vd2hlcmUnO1xuXG4vKipcbiAqIENvbXB1dGUgUVIgZGVjb21wb3NpdGlvbiBvZiBtLWJ5LW4gbWF0cml4IHVzaW5nIEhvdXNlaG9sZGVyIHRyYW5zZm9ybWF0aW9uLlxuICpcbiAqIEltcGxlbWVudGF0aW9uIGJhc2VkIG9uXG4gKiAgIFtodHRwOi8vd3d3LmNzLmNvcm5lbGwuZWR1L35iaW5kZWwvY2xhc3MvY3M2MjEwLWYwOS9sZWMxOC5wZGZdXG4gKiAoaHR0cDovL3d3dy5jcy5jb3JuZWxsLmVkdS9+YmluZGVsL2NsYXNzL2NzNjIxMC1mMDkvbGVjMTgucGRmKVxuICpcbiAqIGBgYGpzXG4gKiBjb25zdCBhID0gdGYudGVuc29yMmQoW1sxLCAyXSwgWzMsIDRdXSk7XG4gKiBsZXQgW3EsIHJdID0gdGYubGluYWxnLnFyKGEpO1xuICogY29uc29sZS5sb2coJ1EnKTtcbiAqIHEucHJpbnQoKTtcbiAqIGNvbnNvbGUubG9nKCdSJyk7XG4gKiByLnByaW50KCk7XG4gKiBjb25zb2xlLmxvZygnT3J0aG9nb25hbGl6ZWQnKTtcbiAqIHEuZG90KHEudHJhbnNwb3NlKCkpLnByaW50KCkgIC8vIHNob3VsZCBiZSBuZWFybHkgdGhlIGlkZW50aXR5IG1hdHJpeC5cbiAqIGNvbnNvbGUubG9nKCdSZWNvbnN0cnVjdGVkJyk7XG4gKiBxLmRvdChyKS5wcmludCgpOyAvLyBzaG91bGQgYmUgbmVhcmx5IFtbMSwgMl0sIFszLCA0XV07XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0geCBUaGUgYHRmLlRlbnNvcmAgdG8gYmUgUVItZGVjb21wb3NlZC4gTXVzdCBoYXZlIHJhbmsgPj0gMi4gU3VwcG9zZVxuICogICBpdCBoYXMgdGhlIHNoYXBlIGBbLi4uLCBNLCBOXWAuXG4gKiBAcGFyYW0gZnVsbE1hdHJpY2VzIEFuIG9wdGlvbmFsIGJvb2xlYW4gcGFyYW1ldGVyLiBEZWZhdWx0cyB0byBgZmFsc2VgLlxuICogICBJZiBgdHJ1ZWAsIGNvbXB1dGUgZnVsbC1zaXplZCBgUWAuIElmIGBmYWxzZWAgKHRoZSBkZWZhdWx0KSxcbiAqICAgY29tcHV0ZSBvbmx5IHRoZSBsZWFkaW5nIE4gY29sdW1ucyBvZiBgUWAgYW5kIGBSYC5cbiAqIEByZXR1cm5zIEFuIGBBcnJheWAgb2YgdHdvIGB0Zi5UZW5zb3JgczogYFtRLCBSXWAuIGBRYCBpcyBhIHVuaXRhcnkgbWF0cml4LFxuICogICBpLmUuLCBpdHMgY29sdW1ucyBhbGwgaGF2ZSB1bml0IG5vcm0gYW5kIGFyZSBtdXR1YWxseSBvcnRob2dvbmFsLlxuICogICBJZiBgTSA+PSBOYCxcbiAqICAgICBJZiBgZnVsbE1hdHJpY2VzYCBpcyBgZmFsc2VgIChkZWZhdWx0KSxcbiAqICAgICAgIC0gYFFgIGhhcyBhIHNoYXBlIG9mIGBbLi4uLCBNLCBOXWAsXG4gKiAgICAgICAtIGBSYCBoYXMgYSBzaGFwZSBvZiBgWy4uLiwgTiwgTl1gLlxuICogICAgIElmIGBmdWxsTWF0cmljZXNgIGlzIGB0cnVlYCAoZGVmYXVsdCksXG4gKiAgICAgICAtIGBRYCBoYXMgYSBzaGFwZSBvZiBgWy4uLiwgTSwgTV1gLFxuICogICAgICAgLSBgUmAgaGFzIGEgc2hhcGUgb2YgYFsuLi4sIE0sIE5dYC5cbiAqICAgSWYgYE0gPCBOYCxcbiAqICAgICAtIGBRYCBoYXMgYSBzaGFwZSBvZiBgWy4uLiwgTSwgTV1gLFxuICogICAgIC0gYFJgIGhhcyBhIHNoYXBlIG9mIGBbLi4uLCBNLCBOXWAuXG4gKiBAdGhyb3dzIElmIHRoZSByYW5rIG9mIGB4YCBpcyBsZXNzIHRoYW4gMi5cbiAqXG4gKiBAZG9jIHtoZWFkaW5nOidPcGVyYXRpb25zJyxcbiAqICAgICAgIHN1YmhlYWRpbmc6J0xpbmVhciBBbGdlYnJhJyxcbiAqICAgICAgIG5hbWVzcGFjZTonbGluYWxnJ31cbiAqL1xuZnVuY3Rpb24gcXJfKHg6IFRlbnNvciwgZnVsbE1hdHJpY2VzID0gZmFsc2UpOiBbVGVuc29yLCBUZW5zb3JdIHtcbiAgYXNzZXJ0KFxuICAgICAgeC5yYW5rID49IDIsXG4gICAgICAoKSA9PiBgcXIoKSByZXF1aXJlcyBpbnB1dCB0ZW5zb3IgdG8gaGF2ZSBhIHJhbmsgPj0gMiwgYnV0IGdvdCByYW5rICR7XG4gICAgICAgICAgeC5yYW5rfWApO1xuXG4gIGlmICh4LnJhbmsgPT09IDIpIHtcbiAgICByZXR1cm4gcXIyZCh4IGFzIFRlbnNvcjJELCBmdWxsTWF0cmljZXMpO1xuICB9IGVsc2Uge1xuICAgIC8vIFJhbmsgPiAyLlxuICAgIC8vIFRPRE8oY2Fpcyk6IEJlbG93IHdlIHNwbGl0IHRoZSBpbnB1dCBpbnRvIGluZGl2aWR1YWwgMkQgdGVuc29ycyxcbiAgICAvLyAgIHBlcmZvcm0gUVIgZGVjb21wb3NpdGlvbiBvbiB0aGVtIGFuZCB0aGVuIHN0YWNrIHRoZSByZXN1bHRzIGJhY2tcbiAgICAvLyAgIHRvZ2V0aGVyLiBXZSBzaG91bGQgZXhwbG9yZSB3aGV0aGVyIHRoaXMgY2FuIGJlIHBhcmFsbGVsaXplZC5cbiAgICBjb25zdCBvdXRlckRpbXNQcm9kID0geC5zaGFwZS5zbGljZSgwLCB4LnNoYXBlLmxlbmd0aCAtIDIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVkdWNlKCh2YWx1ZSwgcHJldikgPT4gdmFsdWUgKiBwcmV2KTtcbiAgICBjb25zdCB4MmRzID0gdW5zdGFjayhcbiAgICAgICAgcmVzaGFwZShcbiAgICAgICAgICAgIHgsXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIG91dGVyRGltc1Byb2QsIHguc2hhcGVbeC5zaGFwZS5sZW5ndGggLSAyXSxcbiAgICAgICAgICAgICAgeC5zaGFwZVt4LnNoYXBlLmxlbmd0aCAtIDFdXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgMCk7XG4gICAgY29uc3QgcTJkczogVGVuc29yMkRbXSA9IFtdO1xuICAgIGNvbnN0IHIyZHM6IFRlbnNvcjJEW10gPSBbXTtcbiAgICB4MmRzLmZvckVhY2goeDJkID0+IHtcbiAgICAgIGNvbnN0IFtxMmQsIHIyZF0gPSBxcjJkKHgyZCBhcyBUZW5zb3IyRCwgZnVsbE1hdHJpY2VzKTtcbiAgICAgIHEyZHMucHVzaChxMmQpO1xuICAgICAgcjJkcy5wdXNoKHIyZCk7XG4gICAgfSk7XG4gICAgY29uc3QgcSA9IHJlc2hhcGUoc3RhY2socTJkcywgMCksIHguc2hhcGUpO1xuICAgIGNvbnN0IHIgPSByZXNoYXBlKHN0YWNrKHIyZHMsIDApLCB4LnNoYXBlKTtcbiAgICByZXR1cm4gW3EsIHJdO1xuICB9XG59XG5cbmZ1bmN0aW9uIHFyMmQoeDogVGVuc29yMkQsIGZ1bGxNYXRyaWNlcyA9IGZhbHNlKTogW1RlbnNvcjJELCBUZW5zb3IyRF0ge1xuICByZXR1cm4gRU5HSU5FLnRpZHkoKCkgPT4ge1xuICAgIGFzc2VydChcbiAgICAgICAgeC5zaGFwZS5sZW5ndGggPT09IDIsXG4gICAgICAgICgpID0+IGBxcjJkKCkgcmVxdWlyZXMgYSAyRCBUZW5zb3IsIGJ1dCBnb3QgYSAke1xuICAgICAgICAgICAgeC5zaGFwZS5sZW5ndGh9RCBUZW5zb3IuYCk7XG5cbiAgICBjb25zdCBtID0geC5zaGFwZVswXTtcbiAgICBjb25zdCBuID0geC5zaGFwZVsxXTtcblxuICAgIGxldCBxID0gZXllKG0pOyAgICAvLyBPcnRob2dvbmFsIHRyYW5zZm9ybSBzbyBmYXIuXG4gICAgbGV0IHIgPSBjbG9uZSh4KTsgIC8vIFRyYW5zZm9ybWVkIG1hdHJpeCBzbyBmYXIuXG5cbiAgICBjb25zdCBvbmUyRCA9IHRlbnNvcjJkKFtbMV1dLCBbMSwgMV0pO1xuICAgIGxldCB3OiBUZW5zb3IyRCA9IGNsb25lKG9uZTJEKTtcblxuICAgIGNvbnN0IGl0ZXJzID0gbSA+PSBuID8gbiA6IG07XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBpdGVyczsgKytqKSB7XG4gICAgICAvLyBUaGlzIHRpZHkgd2l0aGluIHRoZSBmb3ItbG9vcCBlbnN1cmVzIHdlIGNsZWFuIHVwIHRlbXBvcmFyeVxuICAgICAgLy8gdGVuc29ycyBhcyBzb29uIGFzIHRoZXkgYXJlIG5vIGxvbmdlciBuZWVkZWQuXG4gICAgICBjb25zdCByVGVtcCA9IHI7XG4gICAgICBjb25zdCB3VGVtcCA9IHc7XG4gICAgICBjb25zdCBxVGVtcCA9IHE7XG4gICAgICBbdywgciwgcV0gPSBFTkdJTkUudGlkeSgoKTogW1RlbnNvcjJELCBUZW5zb3IyRCwgVGVuc29yMkRdID0+IHtcbiAgICAgICAgLy8gRmluZCBIID0gSSAtIHRhdSAqIHcgKiB3JywgdG8gcHV0IHplcm9zIGJlbG93IFIoaiwgaikuXG4gICAgICAgIGNvbnN0IHJqRW5kMSA9IHNsaWNlKHIsIFtqLCBqXSwgW20gLSBqLCAxXSk7XG4gICAgICAgIGNvbnN0IG5vcm1YID0gbm9ybShyakVuZDEpO1xuICAgICAgICBjb25zdCByamogPSBzbGljZShyLCBbaiwgal0sIFsxLCAxXSk7XG5cbiAgICAgICAgLy8gVGhlIHNpZ24oKSBmdW5jdGlvbiByZXR1cm5zIDAgb24gMCwgd2hpY2ggY2F1c2VzIGRpdmlzaW9uIGJ5IHplcm8uXG4gICAgICAgIGNvbnN0IHMgPSB3aGVyZShncmVhdGVyKHJqaiwgMCksIHRlbnNvcjJkKFtbLTFdXSksIHRlbnNvcjJkKFtbMV1dKSk7XG5cbiAgICAgICAgY29uc3QgdTEgPSBzdWIocmpqLCBtdWwocywgbm9ybVgpKTtcbiAgICAgICAgY29uc3Qgd1ByZSA9IGRpdihyakVuZDEsIHUxKTtcbiAgICAgICAgaWYgKHdQcmUuc2hhcGVbMF0gPT09IDEpIHtcbiAgICAgICAgICB3ID0gY2xvbmUob25lMkQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHcgPSBjb25jYXQoXG4gICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBvbmUyRCxcbiAgICAgICAgICAgICAgICBzbGljZSh3UHJlLCBbMSwgMF0sIFt3UHJlLnNoYXBlWzBdIC0gMSwgd1ByZS5zaGFwZVsxXV0pIGFzXG4gICAgICAgICAgICAgICAgICAgIFRlbnNvcjJEXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIDApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRhdSA9IG5lZyhkaXYobWF0TXVsKHMsIHUxKSwgbm9ybVgpKSBhcyBUZW5zb3IyRDtcblxuICAgICAgICAvLyAtLSBSIDo9IEhSLCBRIDo9IFFILlxuICAgICAgICBjb25zdCByakVuZEFsbCA9IHNsaWNlKHIsIFtqLCAwXSwgW20gLSBqLCBuXSk7XG4gICAgICAgIGNvbnN0IHRhdVRpbWVzVzogVGVuc29yMkQgPSBtdWwodGF1LCB3KTtcbiAgICAgICAgY29uc3Qgd1Q6IFRlbnNvcjJEID0gdHJhbnNwb3NlKHcpO1xuICAgICAgICBpZiAoaiA9PT0gMCkge1xuICAgICAgICAgIHIgPSBzdWIocmpFbmRBbGwsIG1hdE11bCh0YXVUaW1lc1csIG1hdE11bCh3VCwgcmpFbmRBbGwpKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgclRpbWVzVGF1OiBUZW5zb3IyRCA9XG4gICAgICAgICAgICAgIHN1YihyakVuZEFsbCwgbWF0TXVsKHRhdVRpbWVzVywgbWF0TXVsKHdULCByakVuZEFsbCkpKTtcbiAgICAgICAgICByID0gY29uY2F0KFtzbGljZShyLCBbMCwgMF0sIFtqLCBuXSksIHJUaW1lc1RhdV0sIDApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRhd1RpbWVzV1Q6IFRlbnNvcjJEID0gdHJhbnNwb3NlKHRhdVRpbWVzVyk7XG4gICAgICAgIGNvbnN0IHFBbGxKRW5kID0gc2xpY2UocSwgWzAsIGpdLCBbbSwgcS5zaGFwZVsxXSAtIGpdKTtcbiAgICAgICAgaWYgKGogPT09IDApIHtcbiAgICAgICAgICBxID0gc3ViKHFBbGxKRW5kLCBtYXRNdWwobWF0TXVsKHFBbGxKRW5kLCB3KSwgdGF3VGltZXNXVCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHFUaW1lc1RhdTogVGVuc29yMkQgPVxuICAgICAgICAgICAgICBzdWIocUFsbEpFbmQsIG1hdE11bChtYXRNdWwocUFsbEpFbmQsIHcpLCB0YXdUaW1lc1dUKSk7XG4gICAgICAgICAgcSA9IGNvbmNhdChbc2xpY2UocSwgWzAsIDBdLCBbbSwgal0pLCBxVGltZXNUYXVdLCAxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW3csIHIsIHFdO1xuICAgICAgfSk7XG4gICAgICBkaXNwb3NlKFtyVGVtcCwgd1RlbXAsIHFUZW1wXSk7XG4gICAgfVxuXG4gICAgaWYgKCFmdWxsTWF0cmljZXMgJiYgbSA+IG4pIHtcbiAgICAgIHEgPSBzbGljZShxLCBbMCwgMF0sIFttLCBuXSk7XG4gICAgICByID0gc2xpY2UociwgWzAsIDBdLCBbbiwgbl0pO1xuICAgIH1cblxuICAgIHJldHVybiBbcSwgcl07XG4gIH0pIGFzIFtUZW5zb3IyRCwgVGVuc29yMkRdO1xufVxuXG5leHBvcnQgY29uc3QgcXIgPSAvKiBAX19QVVJFX18gKi8gb3Aoe3FyX30pO1xuIl19