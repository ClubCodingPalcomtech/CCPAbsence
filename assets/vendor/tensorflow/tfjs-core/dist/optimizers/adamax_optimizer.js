/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
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
import { ENGINE } from '../engine';
import { dispose, tidy } from '../globals';
import { abs } from '../ops/abs';
import { add } from '../ops/add';
import { div } from '../ops/div';
import { maximum } from '../ops/maximum';
import { mul } from '../ops/mul';
import { scalar } from '../ops/scalar';
import { sub } from '../ops/sub';
import { zerosLike } from '../ops/zeros_like';
import { Optimizer } from './optimizer';
export class AdamaxOptimizer extends Optimizer {
    /** @nocollapse */
    static get className() {
        // Name matters for Python compatibility.
        // This is a getter instead of a property because when it's a property, it
        // prevents the entire class from being tree-shaken.
        return 'Adamax';
    }
    constructor(learningRate, beta1, beta2, epsilon = null, decay = 0.0) {
        super();
        this.learningRate = learningRate;
        this.beta1 = beta1;
        this.beta2 = beta2;
        this.epsilon = epsilon;
        this.decay = decay;
        this.accumulatedFirstMoment = [];
        this.accumulatedWeightedInfNorm = [];
        tidy(() => {
            this.iteration = scalar(0).variable();
            this.accBeta1 = scalar(beta1).variable();
        });
        if (epsilon == null) {
            this.epsilon = ENGINE.backend.epsilon();
        }
    }
    applyGradients(variableGradients) {
        const variableNames = Array.isArray(variableGradients) ?
            variableGradients.map(item => item.name) :
            Object.keys(variableGradients);
        tidy(() => {
            const oneMinusAccBeta1 = sub(1, this.accBeta1);
            const lr = div(-this.learningRate, add(mul(this.iteration, this.decay), 1));
            variableNames.forEach((name, i) => {
                const value = ENGINE.registeredVariables[name];
                const trainable = false;
                if (this.accumulatedFirstMoment[i] == null) {
                    this.accumulatedFirstMoment[i] = {
                        originalName: `${name}/m`,
                        variable: zerosLike(value).variable(trainable)
                    };
                }
                if (this.accumulatedWeightedInfNorm[i] == null) {
                    this.accumulatedWeightedInfNorm[i] = {
                        originalName: `${name}/v`,
                        variable: zerosLike(value).variable(trainable)
                    };
                }
                const gradient = Array.isArray(variableGradients) ?
                    variableGradients[i].tensor :
                    variableGradients[name];
                if (gradient == null) {
                    return;
                }
                const firstMoment = this.accumulatedFirstMoment[i].variable;
                const weightedInfNorm = this.accumulatedWeightedInfNorm[i].variable;
                const newFirstMoment = add(mul(firstMoment, this.beta1), mul(gradient, 1 - this.beta1));
                const ut0 = mul(weightedInfNorm, this.beta2);
                const ut1 = abs(gradient);
                const newWeightedInfNorm = maximum(ut0, ut1);
                firstMoment.assign(newFirstMoment);
                weightedInfNorm.assign(newWeightedInfNorm);
                const newValue = add(mul(div(lr, oneMinusAccBeta1), div(newFirstMoment, add(newWeightedInfNorm, this.epsilon))), value);
                value.assign(newValue);
            });
            this.iteration.assign(add(this.iteration, 1));
            this.accBeta1.assign(mul(this.accBeta1, this.beta1));
        });
        this.incrementIterations();
    }
    dispose() {
        this.accBeta1.dispose();
        this.iteration.dispose();
        if (this.accumulatedFirstMoment != null) {
            dispose(this.accumulatedFirstMoment.map(v => v.variable));
        }
        if (this.accumulatedWeightedInfNorm != null) {
            dispose(this.accumulatedWeightedInfNorm.map(v => v.variable));
        }
    }
    async getWeights() {
        throw new Error('getWeights() is not implemented for Adamax yet.');
    }
    async setWeights(weightValues) {
        throw new Error('setWeights() is not implemented for Adamax yet.');
    }
    getConfig() {
        return {
            'learningRate': this.learningRate,
            'beta1': this.beta1,
            'beta2': this.beta2,
            'epsilon': this.epsilon,
            'decay': this.decay
        };
    }
    /** @nocollapse */
    static fromConfig(cls, config) {
        return new cls(config['learningRate'], config['beta1'], config['beta2'], config['epsilon'], config['decay']);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRhbWF4X29wdGltaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3RmanMtY29yZS9zcmMvb3B0aW1pemVycy9hZGFtYXhfb3B0aW1pemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDakMsT0FBTyxFQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDekMsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUMvQixPQUFPLEVBQUMsR0FBRyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQy9CLE9BQU8sRUFBQyxHQUFHLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDL0IsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxHQUFHLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDL0IsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNyQyxPQUFPLEVBQUMsR0FBRyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQy9CLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUs1QyxPQUFPLEVBQUMsU0FBUyxFQUFvQixNQUFNLGFBQWEsQ0FBQztBQUV6RCxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxTQUFTO0lBQzVDLGtCQUFrQjtJQUNsQixNQUFNLEtBQUssU0FBUztRQUNsQix5Q0FBeUM7UUFDekMsMEVBQTBFO1FBQzFFLG9EQUFvRDtRQUNwRCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBT0QsWUFDYyxZQUFvQixFQUFZLEtBQWEsRUFDN0MsS0FBYSxFQUFZLFVBQWtCLElBQUksRUFDL0MsUUFBUSxHQUFHO1FBQ3ZCLEtBQUssRUFBRSxDQUFDO1FBSEksaUJBQVksR0FBWixZQUFZLENBQVE7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RSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUMxQyxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAxOCBHb29nbGUgTExDLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5cbmltcG9ydCB7RU5HSU5FfSBmcm9tICcuLi9lbmdpbmUnO1xuaW1wb3J0IHtkaXNwb3NlLCB0aWR5fSBmcm9tICcuLi9nbG9iYWxzJztcbmltcG9ydCB7YWJzfSBmcm9tICcuLi9vcHMvYWJzJztcbmltcG9ydCB7YWRkfSBmcm9tICcuLi9vcHMvYWRkJztcbmltcG9ydCB7ZGl2fSBmcm9tICcuLi9vcHMvZGl2JztcbmltcG9ydCB7bWF4aW11bX0gZnJvbSAnLi4vb3BzL21heGltdW0nO1xuaW1wb3J0IHttdWx9IGZyb20gJy4uL29wcy9tdWwnO1xuaW1wb3J0IHtzY2FsYXJ9IGZyb20gJy4uL29wcy9zY2FsYXInO1xuaW1wb3J0IHtzdWJ9IGZyb20gJy4uL29wcy9zdWInO1xuaW1wb3J0IHt6ZXJvc0xpa2V9IGZyb20gJy4uL29wcy96ZXJvc19saWtlJztcbmltcG9ydCB7Q29uZmlnRGljdCwgU2VyaWFsaXphYmxlLCBTZXJpYWxpemFibGVDb25zdHJ1Y3Rvcn0gZnJvbSAnLi4vc2VyaWFsaXphdGlvbic7XG5pbXBvcnQge1ZhcmlhYmxlfSBmcm9tICcuLi90ZW5zb3InO1xuaW1wb3J0IHtOYW1lZFRlbnNvciwgTmFtZWRWYXJpYWJsZU1hcH0gZnJvbSAnLi4vdGVuc29yX3R5cGVzJztcblxuaW1wb3J0IHtPcHRpbWl6ZXIsIE9wdGltaXplclZhcmlhYmxlfSBmcm9tICcuL29wdGltaXplcic7XG5cbmV4cG9ydCBjbGFzcyBBZGFtYXhPcHRpbWl6ZXIgZXh0ZW5kcyBPcHRpbWl6ZXIge1xuICAvKiogQG5vY29sbGFwc2UgKi9cbiAgc3RhdGljIGdldCBjbGFzc05hbWUoKSB7XG4gICAgLy8gTmFtZSBtYXR0ZXJzIGZvciBQeXRob24gY29tcGF0aWJpbGl0eS5cbiAgICAvLyBUaGlzIGlzIGEgZ2V0dGVyIGluc3RlYWQgb2YgYSBwcm9wZXJ0eSBiZWNhdXNlIHdoZW4gaXQncyBhIHByb3BlcnR5LCBpdFxuICAgIC8vIHByZXZlbnRzIHRoZSBlbnRpcmUgY2xhc3MgZnJvbSBiZWluZyB0cmVlLXNoYWtlbi5cbiAgICByZXR1cm4gJ0FkYW1heCc7XG4gIH1cbiAgcHJpdmF0ZSBhY2NCZXRhMTogVmFyaWFibGU7XG4gIHByaXZhdGUgaXRlcmF0aW9uOiBWYXJpYWJsZTtcblxuICBwcml2YXRlIGFjY3VtdWxhdGVkRmlyc3RNb21lbnQ6IE9wdGltaXplclZhcmlhYmxlW10gPSBbXTtcbiAgcHJpdmF0ZSBhY2N1bXVsYXRlZFdlaWdodGVkSW5mTm9ybTogT3B0aW1pemVyVmFyaWFibGVbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJvdGVjdGVkIGxlYXJuaW5nUmF0ZTogbnVtYmVyLCBwcm90ZWN0ZWQgYmV0YTE6IG51bWJlcixcbiAgICAgIHByb3RlY3RlZCBiZXRhMjogbnVtYmVyLCBwcm90ZWN0ZWQgZXBzaWxvbjogbnVtYmVyID0gbnVsbCxcbiAgICAgIHByb3RlY3RlZCBkZWNheSA9IDAuMCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aWR5KCgpID0+IHtcbiAgICAgIHRoaXMuaXRlcmF0aW9uID0gc2NhbGFyKDApLnZhcmlhYmxlKCk7XG4gICAgICB0aGlzLmFjY0JldGExID0gc2NhbGFyKGJldGExKS52YXJpYWJsZSgpO1xuICAgIH0pO1xuXG4gICAgaWYgKGVwc2lsb24gPT0gbnVsbCkge1xuICAgICAgdGhpcy5lcHNpbG9uID0gRU5HSU5FLmJhY2tlbmQuZXBzaWxvbigpO1xuICAgIH1cbiAgfVxuXG4gIGFwcGx5R3JhZGllbnRzKHZhcmlhYmxlR3JhZGllbnRzOiBOYW1lZFZhcmlhYmxlTWFwfE5hbWVkVGVuc29yW10pIHtcbiAgICBjb25zdCB2YXJpYWJsZU5hbWVzID0gQXJyYXkuaXNBcnJheSh2YXJpYWJsZUdyYWRpZW50cykgP1xuICAgICAgICB2YXJpYWJsZUdyYWRpZW50cy5tYXAoaXRlbSA9PiBpdGVtLm5hbWUpIDpcbiAgICAgICAgT2JqZWN0LmtleXModmFyaWFibGVHcmFkaWVudHMpO1xuXG4gICAgdGlkeSgoKSA9PiB7XG4gICAgICBjb25zdCBvbmVNaW51c0FjY0JldGExID0gc3ViKDEsIHRoaXMuYWNjQmV0YTEpO1xuICAgICAgY29uc3QgbHIgPVxuICAgICAgICAgIGRpdigtdGhpcy5sZWFybmluZ1JhdGUsIGFkZChtdWwodGhpcy5pdGVyYXRpb24sIHRoaXMuZGVjYXkpLCAxKSk7XG5cbiAgICAgIHZhcmlhYmxlTmFtZXMuZm9yRWFjaCgobmFtZSwgaSkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IEVOR0lORS5yZWdpc3RlcmVkVmFyaWFibGVzW25hbWVdO1xuICAgICAgICBjb25zdCB0cmFpbmFibGUgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuYWNjdW11bGF0ZWRGaXJzdE1vbWVudFtpXSA9PSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5hY2N1bXVsYXRlZEZpcnN0TW9tZW50W2ldID0ge1xuICAgICAgICAgICAgb3JpZ2luYWxOYW1lOiBgJHtuYW1lfS9tYCxcbiAgICAgICAgICAgIHZhcmlhYmxlOiB6ZXJvc0xpa2UodmFsdWUpLnZhcmlhYmxlKHRyYWluYWJsZSlcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmFjY3VtdWxhdGVkV2VpZ2h0ZWRJbmZOb3JtW2ldID09IG51bGwpIHtcbiAgICAgICAgICB0aGlzLmFjY3VtdWxhdGVkV2VpZ2h0ZWRJbmZOb3JtW2ldID0ge1xuICAgICAgICAgICAgb3JpZ2luYWxOYW1lOiBgJHtuYW1lfS92YCxcbiAgICAgICAgICAgIHZhcmlhYmxlOiB6ZXJvc0xpa2UodmFsdWUpLnZhcmlhYmxlKHRyYWluYWJsZSlcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZ3JhZGllbnQgPSBBcnJheS5pc0FycmF5KHZhcmlhYmxlR3JhZGllbnRzKSA/XG4gICAgICAgICAgICB2YXJpYWJsZUdyYWRpZW50c1tpXS50ZW5zb3IgOlxuICAgICAgICAgICAgdmFyaWFibGVHcmFkaWVudHNbbmFtZV07XG4gICAgICAgIGlmIChncmFkaWVudCA9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZmlyc3RNb21lbnQgPSB0aGlzLmFjY3VtdWxhdGVkRmlyc3RNb21lbnRbaV0udmFyaWFibGU7XG4gICAgICAgIGNvbnN0IHdlaWdodGVkSW5mTm9ybSA9IHRoaXMuYWNjdW11bGF0ZWRXZWlnaHRlZEluZk5vcm1baV0udmFyaWFibGU7XG5cbiAgICAgICAgY29uc3QgbmV3Rmlyc3RNb21lbnQgPVxuICAgICAgICAgICAgYWRkKG11bChmaXJzdE1vbWVudCwgdGhpcy5iZXRhMSksIG11bChncmFkaWVudCwgMSAtIHRoaXMuYmV0YTEpKTtcblxuICAgICAgICBjb25zdCB1dDAgPSBtdWwod2VpZ2h0ZWRJbmZOb3JtLCB0aGlzLmJldGEyKTtcbiAgICAgICAgY29uc3QgdXQxID0gYWJzKGdyYWRpZW50KTtcblxuICAgICAgICBjb25zdCBuZXdXZWlnaHRlZEluZk5vcm0gPSBtYXhpbXVtKHV0MCwgdXQxKTtcblxuICAgICAgICBmaXJzdE1vbWVudC5hc3NpZ24obmV3Rmlyc3RNb21lbnQpO1xuICAgICAgICB3ZWlnaHRlZEluZk5vcm0uYXNzaWduKG5ld1dlaWdodGVkSW5mTm9ybSk7XG5cbiAgICAgICAgY29uc3QgbmV3VmFsdWUgPVxuICAgICAgICAgICAgYWRkKG11bChkaXYobHIsIG9uZU1pbnVzQWNjQmV0YTEpLFxuICAgICAgICAgICAgICAgICAgICBkaXYobmV3Rmlyc3RNb21lbnQsIGFkZChuZXdXZWlnaHRlZEluZk5vcm0sIHRoaXMuZXBzaWxvbikpKSxcbiAgICAgICAgICAgICAgICB2YWx1ZSk7XG5cbiAgICAgICAgdmFsdWUuYXNzaWduKG5ld1ZhbHVlKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLml0ZXJhdGlvbi5hc3NpZ24oYWRkKHRoaXMuaXRlcmF0aW9uLCAxKSk7XG4gICAgICB0aGlzLmFjY0JldGExLmFzc2lnbihtdWwodGhpcy5hY2NCZXRhMSwgdGhpcy5iZXRhMSkpO1xuICAgIH0pO1xuICAgIHRoaXMuaW5jcmVtZW50SXRlcmF0aW9ucygpO1xuICB9XG5cbiAgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmFjY0JldGExLmRpc3Bvc2UoKTtcbiAgICB0aGlzLml0ZXJhdGlvbi5kaXNwb3NlKCk7XG5cbiAgICBpZiAodGhpcy5hY2N1bXVsYXRlZEZpcnN0TW9tZW50ICE9IG51bGwpIHtcbiAgICAgIGRpc3Bvc2UodGhpcy5hY2N1bXVsYXRlZEZpcnN0TW9tZW50Lm1hcCh2ID0+IHYudmFyaWFibGUpKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuYWNjdW11bGF0ZWRXZWlnaHRlZEluZk5vcm0gIT0gbnVsbCkge1xuICAgICAgZGlzcG9zZSh0aGlzLmFjY3VtdWxhdGVkV2VpZ2h0ZWRJbmZOb3JtLm1hcCh2ID0+IHYudmFyaWFibGUpKTtcbiAgICB9XG4gIH1cblxuICBvdmVycmlkZSBhc3luYyBnZXRXZWlnaHRzKCk6IFByb21pc2U8TmFtZWRUZW5zb3JbXT4ge1xuICAgIHRocm93IG5ldyBFcnJvcignZ2V0V2VpZ2h0cygpIGlzIG5vdCBpbXBsZW1lbnRlZCBmb3IgQWRhbWF4IHlldC4nKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGFzeW5jIHNldFdlaWdodHMod2VpZ2h0VmFsdWVzOiBOYW1lZFRlbnNvcltdKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRXZWlnaHRzKCkgaXMgbm90IGltcGxlbWVudGVkIGZvciBBZGFtYXggeWV0LicpO1xuICB9XG5cbiAgZ2V0Q29uZmlnKCk6IENvbmZpZ0RpY3Qge1xuICAgIHJldHVybiB7XG4gICAgICAnbGVhcm5pbmdSYXRlJzogdGhpcy5sZWFybmluZ1JhdGUsXG4gICAgICAnYmV0YTEnOiB0aGlzLmJldGExLFxuICAgICAgJ2JldGEyJzogdGhpcy5iZXRhMixcbiAgICAgICdlcHNpbG9uJzogdGhpcy5lcHNpbG9uLFxuICAgICAgJ2RlY2F5JzogdGhpcy5kZWNheVxuICAgIH07XG4gIH1cblxuICAvKiogQG5vY29sbGFwc2UgKi9cbiAgc3RhdGljIG92ZXJyaWRlIGZyb21Db25maWc8VCBleHRlbmRzIFNlcmlhbGl6YWJsZT4oXG4gICAgICBjbHM6IFNlcmlhbGl6YWJsZUNvbnN0cnVjdG9yPFQ+LCBjb25maWc6IENvbmZpZ0RpY3QpOiBUIHtcbiAgICByZXR1cm4gbmV3IGNscyhcbiAgICAgICAgY29uZmlnWydsZWFybmluZ1JhdGUnXSwgY29uZmlnWydiZXRhMSddLCBjb25maWdbJ2JldGEyJ10sXG4gICAgICAgIGNvbmZpZ1snZXBzaWxvbiddLCBjb25maWdbJ2RlY2F5J10pO1xuICB9XG59XG4iXX0=