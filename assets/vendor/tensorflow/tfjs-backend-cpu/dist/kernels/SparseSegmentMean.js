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
import { SparseSegmentMean } from '@tensorflow/tfjs-core';
import { sparseSegmentReductionImpl } from './SparseSegmentReduction_impl';
export function sparseSegmentMean(args) {
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
    const [outputData, outputDataShape] = sparseSegmentReductionImpl($data, data.shape, data.dtype, $indices, $segmentIds, true);
    return backend.makeTensorInfo(outputDataShape, data.dtype, outputData);
}
export const sparseSegmentMeanConfig = {
    kernelName: SparseSegmentMean,
    backendName: 'cpu',
    kernelFunc: sparseSegmentMean,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3BhcnNlU2VnbWVudE1lYW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi90ZmpzLWJhY2tlbmQtY3B1L3NyYy9rZXJuZWxzL1NwYXJzZVNlZ21lbnRNZWFuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUVILE9BQU8sRUFBZSxpQkFBaUIsRUFBa0QsTUFBTSx1QkFBdUIsQ0FBQztBQUl2SCxPQUFPLEVBQUMsMEJBQTBCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUV6RSxNQUFNLFVBQVUsaUJBQWlCLENBQzdCLElBQWdFO0lBRWxFLE1BQU0sRUFBQyxNQUFNLEVBQUUsT0FBTyxFQUFDLEdBQUcsSUFBSSxDQUFDO0lBQy9CLE1BQU0sRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBQyxHQUFHLE1BQU0sQ0FBQztJQUMzQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUN6QixNQUFNLElBQUksS0FBSyxDQUNYLDJEQUEyRCxDQUFDLENBQUM7S0FDbEU7SUFDRCxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUM5QixNQUFNLElBQUksS0FBSyxDQUFDO1lBQ1IsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7S0FDMUI7SUFDRCxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNqQyxNQUFNLElBQUksS0FBSyxDQUFDO1lBQ1IsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7S0FDN0I7SUFDRCxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUM1QyxNQUFNLElBQUksS0FBSyxDQUFDLCtDQUErQyxDQUFDLENBQUM7S0FDbEU7SUFFRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBb0IsQ0FBQztJQUNqRSxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBb0IsQ0FBQztJQUN2RSxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBb0IsQ0FBQztJQUU3RSxNQUFNLENBQUMsVUFBVSxFQUFFLGVBQWUsQ0FBQyxHQUFHLDBCQUEwQixDQUM1RCxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDaEUsT0FBTyxPQUFPLENBQUMsY0FBYyxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3pFLENBQUM7QUFFRCxNQUFNLENBQUMsTUFBTSx1QkFBdUIsR0FBaUI7SUFDbkQsVUFBVSxFQUFFLGlCQUFpQjtJQUM3QixXQUFXLEVBQUUsS0FBSztJQUNsQixVQUFVLEVBQUUsaUJBQWlCO0NBQzlCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAyMSBHb29nbGUgTExDLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5cbmltcG9ydCB7S2VybmVsQ29uZmlnLCBTcGFyc2VTZWdtZW50TWVhbiwgU3BhcnNlU2VnbWVudE1lYW5JbnB1dHMsIFRlbnNvckluZm8sIFR5cGVkQXJyYXl9IGZyb20gJ0B0ZW5zb3JmbG93L3RmanMtY29yZSc7XG5cbmltcG9ydCB7TWF0aEJhY2tlbmRDUFV9IGZyb20gJy4uL2JhY2tlbmRfY3B1JztcblxuaW1wb3J0IHtzcGFyc2VTZWdtZW50UmVkdWN0aW9uSW1wbH0gZnJvbSAnLi9TcGFyc2VTZWdtZW50UmVkdWN0aW9uX2ltcGwnO1xuXG5leHBvcnQgZnVuY3Rpb24gc3BhcnNlU2VnbWVudE1lYW4oXG4gICAgYXJnczoge2lucHV0czogU3BhcnNlU2VnbWVudE1lYW5JbnB1dHMsIGJhY2tlbmQ6IE1hdGhCYWNrZW5kQ1BVfSk6XG4gICAgVGVuc29ySW5mbyB7XG4gIGNvbnN0IHtpbnB1dHMsIGJhY2tlbmR9ID0gYXJncztcbiAgY29uc3Qge2RhdGEsIGluZGljZXMsIHNlZ21lbnRJZHN9ID0gaW5wdXRzO1xuICBpZiAoZGF0YS5zaGFwZS5sZW5ndGggPCAxKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgRGF0YSBzaG91bGQgYmUgYXQgbGVhc3QgMSBkaW1lbnNpb25hbCBidXQgcmVjZWl2ZWQgc2NhbGFyYCk7XG4gIH1cbiAgaWYgKGluZGljZXMuc2hhcGUubGVuZ3RoICE9PSAxKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbmRpY2VzIHNob3VsZCBiZSBhIHZlY3RvciBidXQgcmVjZWl2ZWQgc2hhcGVcbiAgICAgICAgICAke2luZGljZXMuc2hhcGV9YCk7XG4gIH1cbiAgaWYgKHNlZ21lbnRJZHMuc2hhcGUubGVuZ3RoICE9PSAxKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBTZWdtZW50IGlkcyBzaG91bGQgYmUgYSB2ZWN0b3IgYnV0IHJlY2VpdmVkIHNoYXBlXG4gICAgICAgICAgJHtzZWdtZW50SWRzLnNoYXBlfWApO1xuICB9XG4gIGlmIChpbmRpY2VzLnNoYXBlWzBdICE9PSBzZWdtZW50SWRzLnNoYXBlWzBdKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBzZWdtZW50SWRzIGFuZCBpbmRpY2VzIHNob3VsZCBoYXZlIHNhbWUgc2l6ZS5gKTtcbiAgfVxuXG4gIGNvbnN0ICRkYXRhID0gYmFja2VuZC5kYXRhLmdldChkYXRhLmRhdGFJZCkudmFsdWVzIGFzIFR5cGVkQXJyYXk7XG4gIGNvbnN0ICRpbmRpY2VzID0gYmFja2VuZC5kYXRhLmdldChpbmRpY2VzLmRhdGFJZCkudmFsdWVzIGFzIFR5cGVkQXJyYXk7XG4gIGNvbnN0ICRzZWdtZW50SWRzID0gYmFja2VuZC5kYXRhLmdldChzZWdtZW50SWRzLmRhdGFJZCkudmFsdWVzIGFzIFR5cGVkQXJyYXk7XG5cbiAgY29uc3QgW291dHB1dERhdGEsIG91dHB1dERhdGFTaGFwZV0gPSBzcGFyc2VTZWdtZW50UmVkdWN0aW9uSW1wbChcbiAgICAgICRkYXRhLCBkYXRhLnNoYXBlLCBkYXRhLmR0eXBlLCAkaW5kaWNlcywgJHNlZ21lbnRJZHMsIHRydWUpO1xuICByZXR1cm4gYmFja2VuZC5tYWtlVGVuc29ySW5mbyhvdXRwdXREYXRhU2hhcGUsIGRhdGEuZHR5cGUsIG91dHB1dERhdGEpO1xufVxuXG5leHBvcnQgY29uc3Qgc3BhcnNlU2VnbWVudE1lYW5Db25maWc6IEtlcm5lbENvbmZpZyA9IHtcbiAga2VybmVsTmFtZTogU3BhcnNlU2VnbWVudE1lYW4sXG4gIGJhY2tlbmROYW1lOiAnY3B1JyxcbiAga2VybmVsRnVuYzogc3BhcnNlU2VnbWVudE1lYW4sXG59O1xuIl19