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
import { backend_util, util } from '@tensorflow/tfjs-core';
import { assertNotComplex } from '../cpu_util';
import { cast } from '../kernels/Cast';
import { complex } from '../kernels/Complex';
/**
 * Template that creates a `KernelFunc` for binary ops.
 * @param name Kernel name.
 * @param binaryKernelImpl A `SimpleBinaryKernelImpl` for the kernel.
 * @param binaryKernelComplexImpl Optional. If exists, represents a
 *     `ComplexBinaryKernelImpl` for the kernel, will be used when input dtype
 *     is `complex64`.
 * @param dtype Optional. If set, the result has this dtype. Otherwise, the
 *     result has the same dtype as the first input. This is mainly used in
 *     comparison kernels, such as Equal, Less, Greater, etc.
 */
export function binaryKernelFunc(name, simpleImpl, complexImpl, dtype) {
    if (complexImpl == null) {
        return ({ inputs, backend }) => {
            const { a, b } = inputs;
            const cpuBackend = backend;
            assertNotComplex([a, b], name);
            const aVals = cpuBackend.data.get(a.dataId).values;
            const bVals = cpuBackend.data.get(b.dataId).values;
            const decodedAVals = a.dtype === 'string' ?
                // tslint:disable-next-line: no-any
                backend_util.fromUint8ToStringArray(aVals) :
                aVals;
            const decodedBVals = a.dtype === 'string' ?
                // tslint:disable-next-line: no-any
                backend_util.fromUint8ToStringArray(bVals) :
                bVals;
            const $dtype = dtype || a.dtype;
            const [resultData, resultShape] = simpleImpl(a.shape, b.shape, decodedAVals, decodedBVals, $dtype);
            return cpuBackend.makeTensorInfo(resultShape, $dtype, resultData);
        };
    }
    return ({ inputs, backend }) => {
        const { a, b } = inputs;
        const cpuBackend = backend;
        if (a.dtype === 'complex64' || b.dtype === 'complex64') {
            const $aComplex = cast({ inputs: { x: a }, backend: cpuBackend, attrs: { dtype: 'complex64' } });
            const $aComplexVals = cpuBackend.data.get($aComplex.dataId);
            const aReal = $aComplexVals.complexTensorInfos.real;
            const aImag = $aComplexVals.complexTensorInfos.imag;
            const aRealVals = cpuBackend.data.get(aReal.dataId).values;
            const aImagVals = cpuBackend.data.get(aImag.dataId).values;
            const $bComplex = cast({ inputs: { x: b }, backend: cpuBackend, attrs: { dtype: 'complex64' } });
            const $bComplexVals = cpuBackend.data.get($bComplex.dataId);
            const bReal = $bComplexVals.complexTensorInfos.real;
            const bImag = $bComplexVals.complexTensorInfos.imag;
            const bRealVals = cpuBackend.data.get(bReal.dataId).values;
            const bImagVals = cpuBackend.data.get(bImag.dataId).values;
            const [resultRealData, resultImagData, resultShape] = complexImpl(a.shape, b.shape, aRealVals, aImagVals, bRealVals, bImagVals);
            const resultReal = cpuBackend.makeTensorInfo(resultShape, 'float32', resultRealData);
            const resultImag = cpuBackend.makeTensorInfo(resultShape, 'float32', resultImagData);
            const result = complex({ inputs: { real: resultReal, imag: resultImag }, backend: cpuBackend });
            cpuBackend.disposeIntermediateTensorInfo($aComplex);
            cpuBackend.disposeIntermediateTensorInfo($bComplex);
            cpuBackend.disposeIntermediateTensorInfo(resultReal);
            cpuBackend.disposeIntermediateTensorInfo(resultImag);
            return result;
        }
        else {
            const aVals = cpuBackend.data.get(a.dataId).values;
            const bVals = cpuBackend.data.get(b.dataId).values;
            const $dtype = dtype || a.dtype;
            const [resultData, resultShape] = simpleImpl(a.shape, b.shape, aVals, bVals, $dtype);
            return cpuBackend.makeTensorInfo(resultShape, $dtype, resultData);
        }
    };
}
/**
 * Template that creates the complex type implementation for binary ops.
 * Supports broadcast.
 */
export function createComplexBinaryKernelImpl(op) {
    return (aShape, bShape, aRealVals, aImagVals, bRealVals, bImagVals) => {
        const resultShape = backend_util.assertAndGetBroadcastShape(aShape, bShape);
        const resultSize = util.sizeFromShape(resultShape);
        const resultRank = resultShape.length;
        const resultStrides = util.computeStrides(resultShape);
        const resultRealVals = util.getTypedArrayFromDType('float32', resultSize);
        const resultImagVals = util.getTypedArrayFromDType('float32', resultSize);
        const aBroadcastDims = backend_util.getBroadcastDims(aShape, resultShape);
        const bBroadcastDims = backend_util.getBroadcastDims(bShape, resultShape);
        const aVals = backend_util.mergeRealAndImagArrays(aRealVals, aImagVals);
        const bVals = backend_util.mergeRealAndImagArrays(bRealVals, bImagVals);
        const aRank = aShape.length;
        const aStrides = util.computeStrides(aShape);
        const bRank = bShape.length;
        const bStrides = util.computeStrides(bShape);
        if (aBroadcastDims.length + bBroadcastDims.length === 0) {
            for (let i = 0; i < resultRealVals.length; i++) {
                const aIdx = i % aVals.length;
                const bIdx = i % bVals.length;
                const result = op(aVals[aIdx * 2], aVals[aIdx * 2 + 1], bVals[bIdx * 2], bVals[bIdx * 2 + 1]);
                resultRealVals[i] = result.real;
                resultImagVals[i] = result.imag;
            }
        }
        else {
            for (let i = 0; i < resultRealVals.length; i++) {
                const loc = util.indexToLoc(i, resultRank, resultStrides);
                const aLoc = loc.slice(-aRank);
                aBroadcastDims.forEach(d => aLoc[d] = 0);
                const aIndex = util.locToIndex(aLoc, aRank, aStrides);
                const bLoc = loc.slice(-bRank);
                bBroadcastDims.forEach(d => bLoc[d] = 0);
                const bIndex = util.locToIndex(bLoc, bRank, bStrides);
                const opResult = op(aVals[aIndex * 2], aVals[aIndex * 2 + 1], bVals[bIndex * 2], bVals[bIndex * 2 + 1]);
                resultRealVals[i] = opResult.real;
                resultImagVals[i] = opResult.imag;
            }
        }
        return [resultRealVals, resultImagVals, resultShape];
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluYXJ5X3V0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vdGZqcy1iYWNrZW5kLWNwdS9zcmMvdXRpbHMvYmluYXJ5X3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQWtELElBQUksRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBR3pHLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUM3QyxPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDckMsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBSTNDOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFNLFVBQVUsZ0JBQWdCLENBQzVCLElBQVksRUFBRSxVQUFrQyxFQUNoRCxXQUFxQyxFQUFFLEtBQWdCO0lBQ3pELElBQUksV0FBVyxJQUFJLElBQUksRUFBRTtRQUN2QixPQUFPLENBQUMsRUFBQyxNQUFNLEVBQUUsT0FBTyxFQUFDLEVBQUUsRUFBRTtZQUMzQixNQUFNLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxHQUFHLE1BQXNCLENBQUM7WUFDdEMsTUFBTSxVQUFVLEdBQUcsT0FBeUIsQ0FBQztZQUU3QyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUUvQixNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBb0IsQ0FBQztZQUNqRSxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBb0IsQ0FBQztZQUVqRSxNQUFNLFlBQVksR0FBRyxDQUFDLENBQUMsS0FBSyxLQUFLLFFBQVEsQ0FBQyxD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QUFLLENBQUMsQ0FBQztnQkFDL0IsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDekMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUV0RCxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQy9CLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFFdEQsTUFBTSxRQUFRLEdBQ1YsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFDM0QsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFOUIsY0FBYyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7Z0JBQ2xDLGNBQWMsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO2FBQ25DO1NBQ0Y7UUFDRCxPQUFPLENBQUMsY0FBYyxFQUFFLGNBQWMsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUN2RCxDQUFDLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMjAgR29vZ2xlIExMQy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5pbXBvcnQge2JhY2tlbmRfdXRpbCwgQmluYXJ5SW5wdXRzLCBEYXRhVHlwZSwgS2VybmVsRnVuYywgVHlwZWRBcnJheSwgdXRpbH0gZnJvbSAnQHRlbnNvcmZsb3cvdGZqcy1jb3JlJztcblxuaW1wb3J0IHtNYXRoQmFja2VuZENQVX0gZnJvbSAnLi4vYmFja2VuZF9jcHUnO1xuaW1wb3J0IHthc3NlcnROb3RDb21wbGV4fSBmcm9tICcuLi9jcHVfdXRpbCc7XG5pbXBvcnQge2Nhc3R9IGZyb20gJy4uL2tlcm5lbHMvQ2FzdCc7XG5pbXBvcnQge2NvbXBsZXh9IGZyb20gJy4uL2tlcm5lbHMvQ29tcGxleCc7XG5cbmltcG9ydCB7Q29tcGxleEJpbmFyeUtlcm5lbEltcGwsIENvbXBsZXhCaW5hcnlPcGVyYXRpb24sIFNpbXBsZUJpbmFyeUtlcm5lbEltcGx9IGZyb20gJy4vYmluYXJ5X3R5cGVzJztcblxuLyoqXG4gKiBUZW1wbGF0ZSB0aGF0IGNyZWF0ZXMgYSBgS2VybmVsRnVuY2AgZm9yIGJpbmFyeSBvcHMuXG4gKiBAcGFyYW0gbmFtZSBLZXJuZWwgbmFtZS5cbiAqIEBwYXJhbSBiaW5hcnlLZXJuZWxJbXBsIEEgYFNpbXBsZUJpbmFyeUtlcm5lbEltcGxgIGZvciB0aGUga2VybmVsLlxuICogQHBhcmFtIGJpbmFyeUtlcm5lbENvbXBsZXhJbXBsIE9wdGlvbmFsLiBJZiBleGlzdHMsIHJlcHJlc2VudHMgYVxuICogICAgIGBDb21wbGV4QmluYXJ5S2VybmVsSW1wbGAgZm9yIHRoZSBrZXJuZWwsIHdpbGwgYmUgdXNlZCB3aGVuIGlucHV0IGR0eXBlXG4gKiAgICAgaXMgYGNvbXBsZXg2NGAuXG4gKiBAcGFyYW0gZHR5cGUgT3B0aW9uYWwuIElmIHNldCwgdGhlIHJlc3VsdCBoYXMgdGhpcyBkdHlwZS4gT3RoZXJ3aXNlLCB0aGVcbiAqICAgICByZXN1bHQgaGFzIHRoZSBzYW1lIGR0eXBlIGFzIHRoZSBmaXJzdCBpbnB1dC4gVGhpcyBpcyBtYWlubHkgdXNlZCBpblxuICogICAgIGNvbXBhcmlzb24ga2VybmVscywgc3VjaCBhcyBFcXVhbCwgTGVzcywgR3JlYXRlciwgZXRjLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYmluYXJ5S2VybmVsRnVuYyhcbiAgICBuYW1lOiBzdHJpbmcsIHNpbXBsZUltcGw6IFNpbXBsZUJpbmFyeUtlcm5lbEltcGwsXG4gICAgY29tcGxleEltcGw/OiBDb21wbGV4QmluYXJ5S2VybmVsSW1wbCwgZHR5cGU/OiBEYXRhVHlwZSk6IEtlcm5lbEZ1bmMge1xuICBpZiAoY29tcGxleEltcGwgPT0gbnVsbCkge1xuICAgIHJldHVybiAoe2lucHV0cywgYmFja2VuZH0pID0+IHtcbiAgICAgIGNvbnN0IHthLCBifSA9IGlucHV0cyBhcyBCaW5hcnlJbnB1dHM7XG4gICAgICBjb25zdCBjcHVCYWNrZW5kID0gYmFja2VuZCBhcyBNYXRoQmFja2VuZENQVTtcblxuICAgICAgYXNzZXJ0Tm90Q29tcGxleChbYSwgYl0sIG5hbWUpO1xuXG4gICAgICBjb25zdCBhVmFscyA9IGNwdUJhY2tlbmQuZGF0YS5nZXQoYS5kYXRhSWQpLnZhbHVlcyBhcyBUeXBlZEFycmF5O1xuICAgICAgY29uc3QgYlZhbHMgPSBjcHVCYWNrZW5kLmRhdGEuZ2V0KGIuZGF0YUlkKS52YWx1ZXMgYXMgVHlwZWRBcnJheTtcblxuICAgICAgY29uc3QgZGVjb2RlZEFWYWxzID0gYS5kdHlwZSA9PT0gJ3N0cmluZycgP1xuICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tYW55XG4gICAgICAgICAgYmFja2VuZF91dGlsLmZyb21VaW50OFRvU3RyaW5nQXJyYXkoYVZhbHMgYXMgYW55IGFzIFVpbnQ4QXJyYXlbXSkgOlxuICAgICAgICAgIGFWYWxzO1xuICAgICAgY29uc3QgZGVjb2RlZEJWYWxzID0gYS5kdHlwZSA9PT0gJ3N0cmluZycgP1xuICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tYW55XG4gICAgICAgICAgYmFja2VuZF91dGlsLmZyb21VaW50OFRvU3RyaW5nQXJyYXkoYlZhbHMgYXMgYW55IGFzIFVpbnQ4QXJyYXlbXSkgOlxuICAgICAgICAgIGJWYWxzO1xuICAgICAgY29uc3QgJGR0eXBlID0gZHR5cGUgfHwgYS5kdHlwZTtcblxuICAgICAgY29uc3QgW3Jlc3VsdERhdGEsIHJlc3VsdFNoYXBlXSA9XG4gICAgICAgICAgc2ltcGxlSW1wbChhLnNoYXBlLCBiLnNoYXBlLCBkZWNvZGVkQVZhbHMsIGRlY29kZWRCVmFscywgJGR0eXBlKTtcblxuICAgICAgcmV0dXJuIGNwdUJhY2tlbmQubWFrZVRlbnNvckluZm8ocmVzdWx0U2hhcGUsICRkdHlwZSwgcmVzdWx0RGF0YSk7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiAoe2lucHV0cywgYmFja2VuZH0pID0+IHtcbiAgICBjb25zdCB7YSwgYn0gPSBpbnB1dHMgYXMgQmluYXJ5SW5wdXRzO1xuICAgIGNvbnN0IGNwdUJhY2tlbmQgPSBiYWNrZW5kIGFzIE1hdGhCYWNrZW5kQ1BVO1xuXG4gICAgaWYgKGEuZHR5cGUgPT09ICdjb21wbGV4NjQnIHx8IGIuZHR5cGUgPT09ICdjb21wbGV4NjQnKSB7XG4gICAgICBjb25zdCAkYUNvbXBsZXggPSBjYXN0KFxuICAgICAgICAgIHtpbnB1dHM6IHt4OiBhfSwgYmFja2VuZDogY3B1QmFja2VuZCwgYXR0cnM6IHtkdHlwZTogJ2NvbXBsZXg2NCd9fSk7XG5cbiAgICAgIGNvbnN0ICRhQ29tcGxleFZhbHMgPSBjcHVCYWNrZW5kLmRhdGEuZ2V0KCRhQ29tcGxleC5kYXRhSWQpO1xuXG4gICAgICBjb25zdCBhUmVhbCA9ICRhQ29tcGxleFZhbHMuY29tcGxleFRlbnNvckluZm9zLnJlYWw7XG4gICAgICBjb25zdCBhSW1hZyA9ICRhQ29tcGxleFZhbHMuY29tcGxleFRlbnNvckluZm9zLmltYWc7XG5cbiAgICAgIGNvbnN0IGFSZWFsVmFscyA9XG4gICAgICAgICAgY3B1QmFja2VuZC5kYXRhLmdldChhUmVhbC5kYXRhSWQpLnZhbHVlcyBhcyBGbG9hdDMyQXJyYXk7XG4gICAgICBjb25zdCBhSW1hZ1ZhbHMgPVxuICAgICAgICAgIGNwdUJhY2tlbmQuZGF0YS5nZXQoYUltYWcuZGF0YUlkKS52YWx1ZXMgYXMgRmxvYXQzMkFycmF5O1xuXG4gICAgICBjb25zdCAkYkNvbXBsZXggPSBjYXN0KFxuICAgICAgICAgIHtpbnB1dHM6IHt4OiBifSwgYmFja2VuZDogY3B1QmFja2VuZCwgYXR0cnM6IHtkdHlwZTogJ2NvbXBsZXg2NCd9fSk7XG5cbiAgICAgIGNvbnN0ICRiQ29tcGxleFZhbHMgPSBjcHVCYWNrZW5kLmRhdGEuZ2V0KCRiQ29tcGxleC5kYXRhSWQpO1xuXG4gICAgICBjb25zdCBiUmVhbCA9ICRiQ29tcGxleFZhbHMuY29tcGxleFRlbnNvckluZm9zLnJlYWw7XG4gICAgICBjb25zdCBiSW1hZyA9ICRiQ29tcGxleFZhbHMuY29tcGxleFRlbnNvckluZm9zLmltYWc7XG5cbiAgICAgIGNvbnN0IGJSZWFsVmFscyA9XG4gICAgICAgICAgY3B1QmFja2VuZC5kYXRhLmdldChiUmVhbC5kYXRhSWQpLnZhbHVlcyBhcyBGbG9hdDMyQXJyYXk7XG4gICAgICBjb25zdCBiSW1hZ1ZhbHMgPVxuICAgICAgICAgIGNwdUJhY2tlbmQuZGF0YS5nZXQoYkltYWcuZGF0YUlkKS52YWx1ZXMgYXMgRmxvYXQzMkFycmF5O1xuXG4gICAgICBjb25zdCBbcmVzdWx0UmVhbERhdGEsIHJlc3VsdEltYWdEYXRhLCByZXN1bHRTaGFwZV0gPSBjb21wbGV4SW1wbChcbiAgICAgICAgICBhLnNoYXBlLCBiLnNoYXBlLCBhUmVhbFZhbHMsIGFJbWFnVmFscywgYlJlYWxWYWxzLCBiSW1hZ1ZhbHMpO1xuXG4gICAgICBjb25zdCByZXN1bHRSZWFsID1cbiAgICAgICAgICBjcHVCYWNrZW5kLm1ha2VUZW5zb3JJbmZvKHJlc3VsdFNoYXBlLCAnZmxvYXQzMicsIHJlc3VsdFJlYWxEYXRhKTtcblxuICAgICAgY29uc3QgcmVzdWx0SW1hZyA9XG4gICAgICAgICAgY3B1QmFja2VuZC5tYWtlVGVuc29ySW5mbyhyZXN1bHRTaGFwZSwgJ2Zsb2F0MzInLCByZXN1bHRJbWFnRGF0YSk7XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGNvbXBsZXgoXG4gICAgICAgICAge2lucHV0czoge3JlYWw6IHJlc3VsdFJlYWwsIGltYWc6IHJlc3VsdEltYWd9LCBiYWNrZW5kOiBjcHVCYWNrZW5kfSk7XG5cbiAgICAgIGNwdUJhY2tlbmQuZGlzcG9zZUludGVybWVkaWF0ZVRlbnNvckluZm8oJGFDb21wbGV4KTtcbiAgICAgIGNwdUJhY2tlbmQuZGlzcG9zZUludGVybWVkaWF0ZVRlbnNvckluZm8oJGJDb21wbGV4KTtcbiAgICAgIGNwdUJhY2tlbmQuZGlzcG9zZUludGVybWVkaWF0ZVRlbnNvckluZm8ocmVzdWx0UmVhbCk7XG4gICAgICBjcHVCYWNrZW5kLmRpc3Bvc2VJbnRlcm1lZGlhdGVUZW5zb3JJbmZvKHJlc3VsdEltYWcpO1xuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBhVmFscyA9IGNwdUJhY2tlbmQuZGF0YS5nZXQoYS5kYXRhSWQpLnZhbHVlcyBhcyBUeXBlZEFycmF5O1xuICAgICAgY29uc3QgYlZhbHMgPSBjcHVCYWNrZW5kLmRhdGEuZ2V0KGIuZGF0YUlkKS52YWx1ZXMgYXMgVHlwZWRBcnJheTtcblxuICAgICAgY29uc3QgJGR0eXBlID0gZHR5cGUgfHwgYS5kdHlwZTtcblxuICAgICAgY29uc3QgW3Jlc3VsdERhdGEsIHJlc3VsdFNoYXBlXSA9XG4gICAgICAgICAgc2ltcGxlSW1wbChhLnNoYXBlLCBiLnNoYXBlLCBhVmFscywgYlZhbHMsICRkdHlwZSk7XG5cbiAgICAgIHJldHVybiBjcHVCYWNrZW5kLm1ha2VUZW5zb3JJbmZvKHJlc3VsdFNoYXBlLCAkZHR5cGUsIHJlc3VsdERhdGEpO1xuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBUZW1wbGF0ZSB0aGF0IGNyZWF0ZXMgdGhlIGNvbXBsZXggdHlwZSBpbXBsZW1lbnRhdGlvbiBmb3IgYmluYXJ5IG9wcy5cbiAqIFN1cHBvcnRzIGJyb2FkY2FzdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNvbXBsZXhCaW5hcnlLZXJuZWxJbXBsKG9wOiBDb21wbGV4QmluYXJ5T3BlcmF0aW9uKTpcbiAgICBDb21wbGV4QmluYXJ5S2VybmVsSW1wbCB7XG4gIHJldHVybiAoYVNoYXBlOiBudW1iZXJbXSwgYlNoYXBlOiBudW1iZXJbXSwgYVJlYWxWYWxzOiBGbG9hdDMyQXJyYXksXG4gICAgICAgICAgYUltYWdWYWxzOiBGbG9hdDMyQXJyYXksIGJSZWFsVmFsczogRmxvYXQzMkFycmF5LFxuICAgICAgICAgIGJJbWFnVmFsczogRmxvYXQzMkFycmF5KTogW1R5cGVkQXJyYXksIFR5cGVkQXJyYXksIG51bWJlcltdXSA9PiB7XG4gICAgY29uc3QgcmVzdWx0U2hhcGUgPSBiYWNrZW5kX3V0aWwuYXNzZXJ0QW5kR2V0QnJvYWRjYXN0U2hhcGUoYVNoYXBlLCBiU2hhcGUpO1xuICAgIGNvbnN0IHJlc3VsdFNpemUgPSB1dGlsLnNpemVGcm9tU2hhcGUocmVzdWx0U2hhcGUpO1xuICAgIGNvbnN0IHJlc3VsdFJhbmsgPSByZXN1bHRTaGFwZS5sZW5ndGg7XG4gICAgY29uc3QgcmVzdWx0U3RyaWRlcyA9IHV0aWwuY29tcHV0ZVN0cmlkZXMocmVzdWx0U2hhcGUpO1xuXG4gICAgY29uc3QgcmVzdWx0UmVhbFZhbHMgPSB1dGlsLmdldFR5cGVkQXJyYXlGcm9tRFR5cGUoJ2Zsb2F0MzInLCByZXN1bHRTaXplKTtcbiAgICBjb25zdCByZXN1bHRJbWFnVmFscyA9IHV0aWwuZ2V0VHlwZWRBcnJheUZyb21EVHlwZSgnZmxvYXQzMicsIHJlc3VsdFNpemUpO1xuXG4gICAgY29uc3QgYUJyb2FkY2FzdERpbXMgPSBiYWNrZW5kX3V0aWwuZ2V0QnJvYWRjYXN0RGltcyhhU2hhcGUsIHJlc3VsdFNoYXBlKTtcbiAgICBjb25zdCBiQnJvYWRjYXN0RGltcyA9IGJhY2tlbmRfdXRpbC5nZXRCcm9hZGNhc3REaW1zKGJTaGFwZSwgcmVzdWx0U2hhcGUpO1xuXG4gICAgY29uc3QgYVZhbHMgPSBiYWNrZW5kX3V0aWwubWVyZ2VSZWFsQW5kSW1hZ0FycmF5cyhhUmVhbFZhbHMsIGFJbWFnVmFscyk7XG4gICAgY29uc3QgYlZhbHMgPSBiYWNrZW5kX3V0aWwubWVyZ2VSZWFsQW5kSW1hZ0FycmF5cyhiUmVhbFZhbHMsIGJJbWFnVmFscyk7XG5cbiAgICBjb25zdCBhUmFuayA9IGFTaGFwZS5sZW5ndGg7XG4gICAgY29uc3QgYVN0cmlkZXMgPSB1dGlsLmNvbXB1dGVTdHJpZGVzKGFTaGFwZSk7XG5cbiAgICBjb25zdCBiUmFuayA9IGJTaGFwZS5sZW5ndGg7XG4gICAgY29uc3QgYlN0cmlkZXMgPSB1dGlsLmNvbXB1dGVTdHJpZGVzKGJTaGFwZSk7XG5cbiAgICBpZiAoYUJyb2FkY2FzdERpbXMubGVuZ3RoICsgYkJyb2FkY2FzdERpbXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlc3VsdFJlYWxWYWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGFJZHggPSBpICUgYVZhbHMubGVuZ3RoO1xuICAgICAgICBjb25zdCBiSWR4ID0gaSAlIGJWYWxzLmxlbmd0aDtcblxuICAgICAgICBjb25zdCByZXN1bHQgPVxuICAgICAgICAgICAgb3AoYVZhbHNbYUlkeCAqIDJdLCBhVmFsc1thSWR4ICogMiArIDFdLCBiVmFsc1tiSWR4ICogMl0sXG4gICAgICAgICAgICAgICBiVmFsc1tiSWR4ICogMiArIDFdKTtcblxuICAgICAgICByZXN1bHRSZWFsVmFsc1tpXSA9IHJlc3VsdC5yZWFsO1xuICAgICAgICByZXN1bHRJbWFnVmFsc1tpXSA9IHJlc3VsdC5pbWFnO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlc3VsdFJlYWxWYWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGxvYyA9IHV0aWwuaW5kZXhUb0xvYyhpLCByZXN1bHRSYW5rLCByZXN1bHRTdHJpZGVzKTtcblxuICAgICAgICBjb25zdCBhTG9jID0gbG9jLnNsaWNlKC1hUmFuayk7XG4gICAgICAgIGFCcm9hZGNhc3REaW1zLmZvckVhY2goZCA9PiBhTG9jW2RdID0gMCk7XG4gICAgICAgIGNvbnN0IGFJbmRleCA9IHV0aWwubG9jVG9JbmRleChhTG9jLCBhUmFuaywgYVN0cmlkZXMpO1xuXG4gICAgICAgIGNvbnN0IGJMb2MgPSBsb2Muc2xpY2UoLWJSYW5rKTtcbiAgICAgICAgYkJyb2FkY2FzdERpbXMuZm9yRWFjaChkID0+IGJMb2NbZF0gPSAwKTtcbiAgICAgICAgY29uc3QgYkluZGV4ID0gdXRpbC5sb2NUb0luZGV4KGJMb2MsIGJSYW5rLCBiU3RyaWRlcyk7XG5cbiAgICAgICAgY29uc3Qgb3BSZXN1bHQgPVxuICAgICAgICAgICAgb3AoYVZhbHNbYUluZGV4ICogMl0sIGFWYWxzW2FJbmRleCAqIDIgKyAxXSwgYlZhbHNbYkluZGV4ICogMl0sXG4gICAgICAgICAgICAgICBiVmFsc1tiSW5kZXggKiAyICsgMV0pO1xuXG4gICAgICAgIHJlc3VsdFJlYWxWYWxzW2ldID0gb3BSZXN1bHQucmVhbDtcbiAgICAgICAgcmVzdWx0SW1hZ1ZhbHNbaV0gPSBvcFJlc3VsdC5pbWFnO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gW3Jlc3VsdFJlYWxWYWxzLCByZXN1bHRJbWFnVmFscywgcmVzdWx0U2hhcGVdO1xuICB9O1xufVxuIl19