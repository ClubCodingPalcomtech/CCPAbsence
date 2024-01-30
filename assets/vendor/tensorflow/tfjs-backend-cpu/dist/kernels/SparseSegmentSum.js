/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
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
import { SparseSegmentSum } from '@tensorflow/tfjs-core';
import { sparseSegmentReductionImpl } from './SparseSegmentReduction_impl';
export function sparseSegmentSum(args) {
    const { inputs, backend } = args;
    const { data, indices, segmentIds } = inputs;
    if (data.shape.length < 1) {
        throw new Error(`Data should be at least 1 dimensional but received scalar`);
    }
    if (indices.shape.length !== 1) {
        throw new Error(`Indices should be a vector but received shape
         ${indices.shape}`);
    }
    if (segmentIds.shape.length !== 1) {
        throw new Error(`Segment ids should be a vector but received shape
         ${segmentIds.shape}`);
    }
    if (indices.shape[0] !== segmentIds.shape[0]) {
        throw new Error(`segmentIds and indices should have same size.`);
    }
    const $data = backend.data.get(data.dataId).values;
    const $indices = backend.data.get(indices.dataId).values;
    const $segmentIds = backend.data.get(segmentIds.dataId).values;
    const [outputData, outputDataShape] = sparseSegmentReductionImpl($data, data.shape, data.dtype, $indices, $segmentIds);
    return backend.makeTensorInfo(outputDataShape, data.dtype, outputData);
}
export const sparseSegmentSumConfig = {
    kernelName: SparseSegmentSum,
    backendName: 'cpu',
    kernelFunc: sparseSegmentSum,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3BhcnNlU2VnbWVudFN1bS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3RmanMtYmFja2VuZC1jcHUvc3JjL2tlcm5lbHMvU3BhcnNlU2VnbWVudFN1bS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7O0dBZUc7QUFFSCxPQUFPLEVBQWUsZ0JBQWdCLEVBQWlELE1BQU0sdUJBQXVCLENBQUM7QUFJckgsT0FBTyxFQUFDLDBCQUEwQixFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFFekUsTUFBTSxVQUFVLGdCQUFnQixDQUM1QixJQUErRDtJQUVqRSxNQUFNLEVBQUMsTUFBTSxFQUFFLE9BQU8sRUFBQyxHQUFHLElBQUksQ0FBQztJQUMvQixNQUFNLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUMsR0FBRyxNQUFNLENBQUM7SUFDM0MsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDekIsTUFBTSxJQUFJLEtBQUssQ0FDWCwyREFBMkQsQ0FBQyxDQUFDO0tBQ2xFO0lBQ0QsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDOUIsTUFBTSxJQUFJLEtBQUssQ0FBQztXQUNULE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0tBQ3pCO0lBQ0QsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDakMsTUFBTSxJQUFJLEtBQUssQ0FBQztXQUNULFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0tBQzVCO0lBQ0QsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDNUMsTUFBTSxJQUFJLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO0tBQ2xFO0lBRUQsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQW9CLENBQUM7SUFDakUsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQW9CLENBQUM7SUFDdkUsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQW9CLENBQUM7SUFFN0UsTUFBTSxDQUFDLFVBQVUsRUFBRSxlQUFlLENBQUMsR0FBRywwQkFBMEIsQ0FDNUQsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDMUQsT0FBTyxPQUFPLENBQUMsY0FBYyxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3pFLENBQUM7QUFFRCxNQUFNLENBQUMsTUFBTSxzQkFBc0IsR0FBaUI7SUFDbEQsVUFBVSxFQUFFLGdCQUFnQjtJQUM1QixXQUFXLEVBQUUsS0FBSztJQUNsQixVQUFVLEVBQUUsZ0JBQWdCO0NBQzdCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAyMSBHb29nbGUgTExDLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5cbmltcG9ydCB7S2VybmVsQ29uZmlnLCBTcGFyc2VTZWdtZW50U3VtLCBTcGFyc2VTZWdtZW50U3VtSW5wdXRzLCBUZW5zb3JJbmZvLCBUeXBlZEFycmF5fSBmcm9tICdAdGVuc29yZmxvdy90ZmpzLWNvcmUnO1xuXG5pbXBvcnQge01hdGhCYWNrZW5kQ1BVfSBmcm9tICcuLi9iYWNrZW5kX2NwdSc7XG5cbmltcG9ydCB7c3BhcnNlU2VnbWVudFJlZHVjdGlvbkltcGx9IGZyb20gJy4vU3BhcnNlU2VnbWVudFJlZHVjdGlvbl9pbXBsJztcblxuZXhwb3J0IGZ1bmN0aW9uIHNwYXJzZVNlZ21lbnRTdW0oXG4gICAgYXJnczoge2lucHV0czogU3BhcnNlU2VnbWVudFN1bUlucHV0cywgYmFja2VuZDogTWF0aEJhY2tlbmRDUFV9KTpcbiAgICBUZW5zb3JJbmZvIHtcbiAgY29uc3Qge2lucHV0cywgYmFja2VuZH0gPSBhcmdzO1xuICBjb25zdCB7ZGF0YSwgaW5kaWNlcywgc2VnbWVudElkc30gPSBpbnB1dHM7XG4gIGlmIChkYXRhLnNoYXBlLmxlbmd0aCA8IDEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBEYXRhIHNob3VsZCBiZSBhdCBsZWFzdCAxIGRpbWVuc2lvbmFsIGJ1dCByZWNlaXZlZCBzY2FsYXJgKTtcbiAgfVxuICBpZiAoaW5kaWNlcy5zaGFwZS5sZW5ndGggIT09IDEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEluZGljZXMgc2hvdWxkIGJlIGEgdmVjdG9yIGJ1dCByZWNlaXZlZCBzaGFwZVxuICAgICAgICAgJHtpbmRpY2VzLnNoYXBlfWApO1xuICB9XG4gIGlmIChzZWdtZW50SWRzLnNoYXBlLmxlbmd0aCAhPT0gMSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgU2VnbWVudCBpZHMgc2hvdWxkIGJlIGEgdmVjdG9yIGJ1dCByZWNlaXZlZCBzaGFwZVxuICAgICAgICAgJHtzZWdtZW50SWRzLnNoYXBlfWApO1xuICB9XG4gIGlmIChpbmRpY2VzLnNoYXBlWzBdICE9PSBzZWdtZW50SWRzLnNoYXBlWzBdKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBzZWdtZW50SWRzIGFuZCBpbmRpY2VzIHNob3VsZCBoYXZlIHNhbWUgc2l6ZS5gKTtcbiAgfVxuXG4gIGNvbnN0ICRkYXRhID0gYmFja2VuZC5kYXRhLmdldChkYXRhLmRhdGFJZCkudmFsdWVzIGFzIFR5cGVkQXJyYXk7XG4gIGNvbnN0ICRpbmRpY2VzID0gYmFja2VuZC5kYXRhLmdldChpbmRpY2VzLmRhdGFJZCkudmFsdWVzIGFzIFR5cGVkQXJyYXk7XG4gIGNvbnN0ICRzZWdtZW50SWRzID0gYmFja2VuZC5kYXRhLmdldChzZWdtZW50SWRzLmRhdGFJZCkudmFsdWVzIGFzIFR5cGVkQXJyYXk7XG5cbiAgY29uc3QgW291dHB1dERhdGEsIG91dHB1dERhdGFTaGFwZV0gPSBzcGFyc2VTZWdtZW50UmVkdWN0aW9uSW1wbChcbiAgICAgICRkYXRhLCBkYXRhLnNoYXBlLCBkYXRhLmR0eXBlLCAkaW5kaWNlcywgJHNlZ21lbnRJZHMpO1xuICByZXR1cm4gYmFja2VuZC5tYWtlVGVuc29ySW5mbyhvdXRwdXREYXRhU2hhcGUsIGRhdGEuZHR5cGUsIG91dHB1dERhdGEpO1xufVxuXG5leHBvcnQgY29uc3Qgc3BhcnNlU2VnbWVudFN1bUNvbmZpZzogS2VybmVsQ29uZmlnID0ge1xuICBrZXJuZWxOYW1lOiBTcGFyc2VTZWdtZW50U3VtLFxuICBiYWNrZW5kTmFtZTogJ2NwdScsXG4gIGtlcm5lbEZ1bmM6IHNwYXJzZVNlZ21lbnRTdW0sXG59O1xuIl19