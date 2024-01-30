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
import { backend_util, Prod, upcastType, util } from '@tensorflow/tfjs-core';
import { assertNotComplex } from '../cpu_util';
import { transpose } from './Transpose';
export function prodImpl(xShape, xDtype, xVals, reductionAxes) {
    const [outShape, reduceShape] = backend_util.computeOutAndReduceShapes(xShape, reductionAxes);
    const outDtype = upcastType(xDtype, 'int32');
    const outVals = util.makeZerosTypedArray(util.sizeFromShape(outShape), outDtype);
    const reduceSize = util.sizeFromShape(reduceShape);
    for (let i = 0; i < outVals.length; ++i) {
        const offset = i * reduceSize;
        let prod = 1;
        for (let j = 0; j < reduceSize; ++j) {
            prod *= xVals[offset + j];
        }
        outVals[i] = prod;
    }
    return { outVals, outShape, outDtype };
}
export function prod(args) {
    const { inputs, backend, attrs } = args;
    const { x } = inputs;
    const { axis, keepDims } = attrs;
    assertNotComplex(x, 'prod');
    const xRank = x.shape.length;
    const axes = util.parseAxisParam(axis, x.shape);
    const permutation = backend_util.getAxesPermutation(axes, xRank);
    let reductionAxes = axes;
    let permutedX = x;
    const intermediateTensorInfos = [];
    if (permutation != null) {
        permutedX = transpose({ inputs: { x }, backend, attrs: { perm: permutation } });
        intermediateTensorInfos.push(permutedX);
        reductionAxes = backend_util.getInnerMostAxes(reductionAxes.length, xRank);
    }
    const xVals = backend.data.get(permutedX.dataId).values;
    const { outVals, outShape, outDtype } = prodImpl(permutedX.shape, permutedX.dtype, xVals, reductionAxes);
    let resultShape = outShape;
    if (keepDims) {
        resultShape = backend_util.expandShapeToKeepDim(outShape, axes);
    }
    intermediateTensorInfos.forEach(t => backend.disposeIntermediateTensorInfo(t));
    return backend.makeTensorInfo(resultShape, outDtype, outVals);
}
export const prodConfig = {
    kernelName: Prod,
    backendName: 'cpu',
    kernelFunc: prod
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3RmanMtYmFja2VuZC1jcHUvc3JjL2tlcm5lbHMvUHJvZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7O0dBZUc7QUFFSCxPQUFPLEVBQUMsWUFBWSxFQUFzQyxJQUFJLEVBQWlELFVBQVUsRUFBRSxJQUFJLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUc5SixPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDN0MsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUV0QyxNQUFNLFVBQVUsUUFBUSxDQUNwQixNQUFnQixFQUFFLE1BQWdCLEVBQUUsS0FBaUIsRUFDckQsYUFBdUI7SUFFekIsTUFBTSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsR0FDekIsWUFBWSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQztJQUNsRSxNQUFNLFFBQVEsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzdDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FDcEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFBRSxRQUFRLENBQWUsQ0FBQztJQUMxRSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBRW5ELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFO1FBQ3ZDLE1BQU0sTUFBTSxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUM7UUFDOUIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ2IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsRUFBRSxFQUFFLENBQUMsRUFBRTtZQUNuQyxJQUFJLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztTQUMzQjtRQUNELE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7S0FDbkI7SUFFRCxPQUFPLEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUMsQ0FBQztBQUN2QyxDQUFDO0FBRUQsTUFBTSxVQUFVLElBQUksQ0FDaEIsSUFBcUU7SUFFdkUsTUFBTSxFQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFDLEdBQUcsSUFBSSxDQUFDO0lBQ3RDLE1BQU0sRUFBQyxDQUFDLEVBQUMsR0FBRyxNQUFNLENBQUM7SUFDbkIsTUFBTSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUMsR0FBRyxLQUFLLENBQUM7SUFFL0IsZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRTVCLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQzdCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUVoRCxNQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2pFLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQztJQUN6QixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFDbEIsTUFBTSx1QkFBdUIsR0FBRyxFQUFFLENBQUM7SUFDbkMsSUFBSSxXQUFXLElBQUksSUFBSSxFQUFFO1FBQ3ZCLFNBQVMsR0FBRyxTQUFTLENBQUMsRUFBQyxNQUFNLEVBQUUsRUFBQyxDQUFDLEVBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBQyxFQUFDLENBQUMsQ0FBQztRQUMxRSx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDeEMsYUFBYSxHQUFHLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQzVFO0lBRUQsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQW9CLENBQUM7SUFDdEUsTUFBTSxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFDLEdBQy9CLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBRXJFLElBQUksV0FBVyxHQUFHLFFBQVEsQ0FBQztJQUMzQixJQUFJLFFBQVEsRUFBRTtRQUNaLFdBQVcsR0FBRyxZQUFZLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ2pFO0lBRUQsdUJBQXVCLENBQUMsT0FBTyxDQUMzQixDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRW5ELE9BQU8sT0FBTyxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ2hFLENBQUM7QUFFRCxNQUFNLENBQUMsTUFBTSxVQUFVLEdBQWlCO0lBQ3RDLFVBQVUsRUFBRSxJQUFJO0lBQ2hCLFdBQVcsRUFBRSxLQUFLO0lBQ2xCLFVBQVUsRUFBRSxJQUE2QjtDQUMxQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMjAgR29vZ2xlIExMQy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5pbXBvcnQge2JhY2tlbmRfdXRpbCwgRGF0YVR5cGUsIEtlcm5lbENvbmZpZywgS2VybmVsRnVuYywgUHJvZCwgUHJvZEF0dHJzLCBQcm9kSW5wdXRzLCBUZW5zb3JJbmZvLCBUeXBlZEFycmF5LCB1cGNhc3RUeXBlLCB1dGlsfSBmcm9tICdAdGVuc29yZmxvdy90ZmpzLWNvcmUnO1xuXG5pbXBvcnQge01hdGhCYWNrZW5kQ1BVfSBmcm9tICcuLi9iYWNrZW5kX2NwdSc7XG5pbXBvcnQge2Fzc2VydE5vdENvbXBsZXh9IGZyb20gJy4uL2NwdV91dGlsJztcbmltcG9ydCB7dHJhbnNwb3NlfSBmcm9tICcuL1RyYW5zcG9zZSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9kSW1wbChcbiAgICB4U2hhcGU6IG51bWJlcltdLCB4RHR5cGU6IERhdGFUeXBlLCB4VmFsczogVHlwZWRBcnJheSxcbiAgICByZWR1Y3Rpb25BeGVzOiBudW1iZXJbXSk6XG4gICAge291dFZhbHM6IFR5cGVkQXJyYXksIG91dFNoYXBlOiBudW1iZXJbXSwgb3V0RHR5cGU6IERhdGFUeXBlfSB7XG4gIGNvbnN0IFtvdXRTaGFwZSwgcmVkdWNlU2hhcGVdID1cbiAgICAgIGJhY2tlbmRfdXRpbC5jb21wdXRlT3V0QW5kUmVkdWNlU2hhcGVzKHhTaGFwZSwgcmVkdWN0aW9uQXhlcyk7XG4gIGNvbnN0IG91dER0eXBlID0gdXBjYXN0VHlwZSh4RHR5cGUsICdpbnQzMicpO1xuICBjb25zdCBvdXRWYWxzID0gdXRpbC5tYWtlWmVyb3NUeXBlZEFycmF5KFxuICAgICAgICAgICAgICAgICAgICAgIHV0aWwuc2l6ZUZyb21TaGFwZShvdXRTaGFwZSksIG91dER0eXBlKSBhcyBUeXBlZEFycmF5O1xuICBjb25zdCByZWR1Y2VTaXplID0gdXRpbC5zaXplRnJvbVNoYXBlKHJlZHVjZVNoYXBlKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IG91dFZhbHMubGVuZ3RoOyArK2kpIHtcbiAgICBjb25zdCBvZmZzZXQgPSBpICogcmVkdWNlU2l6ZTtcbiAgICBsZXQgcHJvZCA9IDE7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCByZWR1Y2VTaXplOyArK2opIHtcbiAgICAgIHByb2QgKj0geFZhbHNbb2Zmc2V0ICsgal07XG4gICAgfVxuICAgIG91dFZhbHNbaV0gPSBwcm9kO1xuICB9XG5cbiAgcmV0dXJuIHtvdXRWYWxzLCBvdXRTaGFwZSwgb3V0RHR5cGV9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvZChcbiAgICBhcmdzOiB7aW5wdXRzOiBQcm9kSW5wdXRzLCBiYWNrZW5kOiBNYXRoQmFja2VuZENQVSwgYXR0cnM6IFByb2RBdHRyc30pOlxuICAgIFRlbnNvckluZm8ge1xuICBjb25zdCB7aW5wdXRzLCBiYWNrZW5kLCBhdHRyc30gPSBhcmdzO1xuICBjb25zdCB7eH0gPSBpbnB1dHM7XG4gIGNvbnN0IHtheGlzLCBrZWVwRGltc30gPSBhdHRycztcblxuICBhc3NlcnROb3RDb21wbGV4KHgsICdwcm9kJyk7XG5cbiAgY29uc3QgeFJhbmsgPSB4LnNoYXBlLmxlbmd0aDtcbiAgY29uc3QgYXhlcyA9IHV0aWwucGFyc2VBeGlzUGFyYW0oYXhpcywgeC5zaGFwZSk7XG5cbiAgY29uc3QgcGVybXV0YXRpb24gPSBiYWNrZW5kX3V0aWwuZ2V0QXhlc1Blcm11dGF0aW9uKGF4ZXMsIHhSYW5rKTtcbiAgbGV0IHJlZHVjdGlvbkF4ZXMgPSBheGVzO1xuICBsZXQgcGVybXV0ZWRYID0geDtcbiAgY29uc3QgaW50ZXJtZWRpYXRlVGVuc29ySW5mb3MgPSBbXTtcbiAgaWYgKHBlcm11dGF0aW9uICE9IG51bGwpIHtcbiAgICBwZXJtdXRlZFggPSB0cmFuc3Bvc2Uoe2lucHV0czoge3h9LCBiYWNrZW5kLCBhdHRyczoge3Blcm06IHBlcm11dGF0aW9ufX0pO1xuICAgIGludGVybWVkaWF0ZVRlbnNvckluZm9zLnB1c2gocGVybXV0ZWRYKTtcbiAgICByZWR1Y3Rpb25BeGVzID0gYmFja2VuZF91dGlsLmdldElubmVyTW9zdEF4ZXMocmVkdWN0aW9uQXhlcy5sZW5ndGgsIHhSYW5rKTtcbiAgfVxuXG4gIGNvbnN0IHhWYWxzID0gYmFja2VuZC5kYXRhLmdldChwZXJtdXRlZFguZGF0YUlkKS52YWx1ZXMgYXMgVHlwZWRBcnJheTtcbiAgY29uc3Qge291dFZhbHMsIG91dFNoYXBlLCBvdXREdHlwZX0gPVxuICAgICAgcHJvZEltcGwocGVybXV0ZWRYLnNoYXBlLCBwZXJtdXRlZFguZHR5cGUsIHhWYWxzLCByZWR1Y3Rpb25BeGVzKTtcblxuICBsZXQgcmVzdWx0U2hhcGUgPSBvdXRTaGFwZTtcbiAgaWYgKGtlZXBEaW1zKSB7XG4gICAgcmVzdWx0U2hhcGUgPSBiYWNrZW5kX3V0aWwuZXhwYW5kU2hhcGVUb0tlZXBEaW0ob3V0U2hhcGUsIGF4ZXMpO1xuICB9XG5cbiAgaW50ZXJtZWRpYXRlVGVuc29ySW5mb3MuZm9yRWFjaChcbiAgICAgIHQgPT4gYmFja2VuZC5kaXNwb3NlSW50ZXJtZWRpYXRlVGVuc29ySW5mbyh0KSk7XG5cbiAgcmV0dXJuIGJhY2tlbmQubWFrZVRlbnNvckluZm8ocmVzdWx0U2hhcGUsIG91dER0eXBlLCBvdXRWYWxzKTtcbn1cblxuZXhwb3J0IGNvbnN0IHByb2RDb25maWc6IEtlcm5lbENvbmZpZyA9IHtcbiAga2VybmVsTmFtZTogUHJvZCxcbiAgYmFja2VuZE5hbWU6ICdjcHUnLFxuICBrZXJuZWxGdW5jOiBwcm9kIGFzIHVua25vd24gYXMgS2VybmVsRnVuY1xufTtcbiJdfQ==