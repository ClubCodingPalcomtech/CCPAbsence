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
import { tidy, util } from '@tensorflow/tfjs-core';
// tslint:disable-next-line: no-imports-from-dist
import * as tfOps from '@tensorflow/tfjs-core/dist/ops/ops_for_converter';
import { getParamValue } from './utils';
export const executeOp = (node, tensorMap, context, ops = tfOps) => {
    switch (node.op) {
        case 'ConcatV2':
        case 'Concat': {
            const n = getParamValue('n', node, tensorMap, context);
            const axis = getParamValue('axis', node, tensorMap, context);
            let inputs = getParamValue('tensors', node, tensorMap, context);
            inputs = inputs.slice(0, n);
            return [ops.concat(inputs, axis)];
        }
        case 'Gather': {
            const input = getParamValue('x', node, tensorMap, context);
            const indices = getParamValue('indices', node, tensorMap, context);
            return [ops.gather(input, ops.cast(indices, 'int32'), 0)];
        }
        case 'GatherV2': {
            const axis = getParamValue('axis', node, tensorMap, context);
            const batchDims = getParamValue('batchDims', node, tensorMap, context);
            const input = getParamValue('x', node, tensorMap, context);
            const indices = getParamValue('indices', node, tensorMap, context);
            return [ops.gather(input, ops.cast(indices, 'int32'), axis, batchDims)];
        }
        case 'Reverse': {
            const dims = getParamValue('dims', node, tensorMap, context);
            const axis = [];
            for (let i = 0; i < dims.length; i++) {
                if (dims[i]) {
                    axis.push(i);
                }
            }
            const input = getParamValue('x', node, tensorMap, context);
            return [ops.reverse(input, axis)];
        }
        case 'ReverseV2': {
            const axis = getParamValue('axis', node, tensorMap, context);
            const input = getParamValue('x', node, tensorMap, context);
            return [ops.reverse(input, axis)];
        }
        case 'Slice': {
            // tslint:disable-next-line:no-any
            const begin = getParamValue('begin', node, tensorMap, context);
            // tslint:disable-next-line:no-any
            const size = getParamValue('size', node, tensorMap, context);
            return [ops.slice(getParamValue('x', node, tensorMap, context), begin, size)];
        }
        case 'StridedSlice': {
            const begin = getParamValue('begin', node, tensorMap, context);
            const end = getParamValue('end', node, tensorMap, context);
            const strides = getParamValue('strides', node, tensorMap, context);
            const beginMask = getParamValue('beginMask', node, tensorMap, context);
            const endMask = getParamValue('endMask', node, tensorMap, context);
            const ellipsisMask = getParamValue('ellipsisMask', node, tensorMap, context);
            const newAxisMask = getParamValue('newAxisMask', node, tensorMap, context);
            const shrinkAxisMask = getParamValue('shrinkAxisMask', node, tensorMap, context);
            const tensor = getParamValue('x', node, tensorMap, context);
            return [ops.stridedSlice(tensor, begin, end, strides, beginMask, endMask, ellipsisMask, newAxisMask, shrinkAxisMask)];
        }
        case 'Pack': {
            return tidy(() => {
                const axis = getParamValue('axis', node, tensorMap, context);
                const tensors = getParamValue('tensors', node, tensorMap, context);
                // Reshape the tensors to the first tensor's shape if they don't
                // match.
                const shape = tensors[0].shape;
                const squeezedShape = ops.squeeze(tensors[0]).shape;
                const mapped = tensors.map(tensor => {
                    const sameShape = util.arraysEqual(tensor.shape, shape);
                    if (!sameShape &&
                        !util.arraysEqual(ops.squeeze(tensor).shape, squeezedShape)) {
                        throw new Error('the input tensors shape does not match');
                    }
                    return sameShape ? tensor : ops.reshape(tensor, shape);
                });
                return [ops.stack(mapped, axis)];
            });
        }
        case 'Unpack': {
            const axis = getParamValue('axis', node, tensorMap, context);
            const tensor = getParamValue('tensor', node, tensorMap, context);
            return ops.unstack(tensor, axis);
        }
        case 'Tile': {
            const reps = getParamValue('reps', node, tensorMap, context);
            return [ops.tile(getParamValue('x', node, tensorMap, context), reps)];
        }
        case 'Split':
        case 'SplitV': {
            const axis = getParamValue('axis', node, tensorMap, context);
            const numOrSizeSplits = getParamValue('numOrSizeSplits', node, tensorMap, context);
            const tensor = getParamValue('x', node, tensorMap, context);
            return ops.split(tensor, numOrSizeSplits, axis);
        }
        case 'ScatterNd': {
            const indices = getParamValue('indices', node, tensorMap, context);
            const values = getParamValue('values', node, tensorMap, context);
            const shape = getParamValue('shape', node, tensorMap, context);
            return [ops.scatterND(indices, values, shape)];
        }
        case 'GatherNd': {
            const x = getParamValue('x', node, tensorMap, context);
            const indices = getParamValue('indices', node, tensorMap, context);
            return [ops.gatherND(x, indices)];
        }
        case 'SparseToDense': {
            const indices = getParamValue('sparseIndices', node, tensorMap, context);
            const shape = getParamValue('outputShape', node, tensorMap, context);
            const sparseValues = getParamValue('sparseValues', node, tensorMap, context);
            const defaultValue = getParamValue('defaultValue', node, tensorMap, context);
            return [ops.sparseToDense(indices, sparseValues, shape, sparseValues.dtype === defaultValue.dtype ?
                    defaultValue :
                    ops.cast(defaultValue, sparseValues.dtype))];
        }
        case 'TensorScatterUpdate': {
            const indices = getParamValue('indices', node, tensorMap, context);
            const values = getParamValue('values', node, tensorMap, context);
            const tensor = getParamValue('tensor', node, tensorMap, context);
            return [ops.tensorScatterUpdate(tensor, indices, values)];
        }
        default:
            throw TypeError(`Node type ${node.op} is not implemented`);
    }
};
export const CATEGORY = 'slice_join';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpY2Vfam9pbl9leGVjdXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3RmanMtY29udmVydGVyL3NyYy9vcGVyYXRpb25zL2V4ZWN1dG9ycy9zbGljZV9qb2luX2V4ZWN1dG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUVILE9BQU8sRUFBMkIsSUFBSSxFQUFFLElBQUksRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzNFLGlEQUFpRDtBQUNqRCxPQUFPLEtBQUssS0FBSyxNQUFNLGtEQUFrRCxDQUFDO0FBTTFFLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFFdEMsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUNsQixDQUFDLElBQVUsRUFBRSxTQUEwQixFQUFFLE9BQXlCLEVBQ2pFLEdBQUcsR0FBRyxLQUFLLEVBQVksRUFBRTtJQUN4QixRQUFRLElBQUksQ0FBQyxFQUFFLEVBQUU7UUFDZixLQUFLLFVBQVUsQ0FBQztRQUNoQixLQUFLLFFBQVEsQ0FBQyxDQUFDO1lBQ2IsTUFBTSxDQUFDLEdBQUcsYUFBYSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBVyxDQUFDO1lBQ2pFLE1BQU0sSUFBSSxHQUNOLGFBQWEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQVcsQ0FBQztZQUM5RCxJQUFJLE1BQU0sR0FDTixhQUFhLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFhLENBQUM7WUFDbkUsTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ25DO1FBQ0QsS0FBSyxRQUFRLENB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QUMsQ0FBQyxDQUFDO1NBQ3REO1FBQ0QsS0FBSyxxQkFBcUIsQ0FBQyxDQUFDO1lBQzFCLE1BQU0sT0FBTyxHQUNULGFBQWEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQVcsQ0FBQztZQUNqRSxNQUFNLE1BQU0sR0FDUixhQUFhLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFXLENBQUM7WUFDaEUsTUFBTSxNQUFNLEdBQ1IsYUFBYSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBVyxDQUFDO1lBQ2hFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1NBQzNEO1FBQ0Q7WUFDRSxNQUFNLFNBQVMsQ0FBQyxhQUFhLElBQUksQ0FBQyxFQUFFLHFCQUFxQixDQUFDLENBQUM7S0FDOUQ7QUFDSCxDQUFDLENBQUM7QUFFTixNQUFNLENBQUMsTUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMTggR29vZ2xlIExMQy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5pbXBvcnQge1NjYWxhciwgVGVuc29yLCBUZW5zb3IxRCwgdGlkeSwgdXRpbH0gZnJvbSAnQHRlbnNvcmZsb3cvdGZqcy1jb3JlJztcbi8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8taW1wb3J0cy1mcm9tLWRpc3RcbmltcG9ydCAqIGFzIHRmT3BzIGZyb20gJ0B0ZW5zb3JmbG93L3RmanMtY29yZS9kaXN0L29wcy9vcHNfZm9yX2NvbnZlcnRlcic7XG5cbmltcG9ydCB7TmFtZWRUZW5zb3JzTWFwfSBmcm9tICcuLi8uLi9kYXRhL3R5cGVzJztcbmltcG9ydCB7RXhlY3V0aW9uQ29udGV4dH0gZnJvbSAnLi4vLi4vZXhlY3V0b3IvZXhlY3V0aW9uX2NvbnRleHQnO1xuaW1wb3J0IHtJbnRlcm5hbE9wRXhlY3V0b3IsIE5vZGV9IGZyb20gJy4uL3R5cGVzJztcblxuaW1wb3J0IHtnZXRQYXJhbVZhbHVlfSBmcm9tICcuL3V0aWxzJztcblxuZXhwb3J0IGNvbnN0IGV4ZWN1dGVPcDogSW50ZXJuYWxPcEV4ZWN1dG9yID1cbiAgICAobm9kZTogTm9kZSwgdGVuc29yTWFwOiBOYW1lZFRlbnNvcnNNYXAsIGNvbnRleHQ6IEV4ZWN1dGlvbkNvbnRleHQsXG4gICAgIG9wcyA9IHRmT3BzKTogVGVuc29yW10gPT4ge1xuICAgICAgc3dpdGNoIChub2RlLm9wKSB7XG4gICAgICAgIGNhc2UgJ0NvbmNhdFYyJzpcbiAgICAgICAgY2FzZSAnQ29uY2F0Jzoge1xuICAgICAgICAgIGNvbnN0IG4gPSBnZXRQYXJhbVZhbHVlKCduJywgbm9kZSwgdGVuc29yTWFwLCBjb250ZXh0KSBhcyBudW1iZXI7XG4gICAgICAgICAgY29uc3QgYXhpcyA9XG4gICAgICAgICAgICAgIGdldFBhcmFtVmFsdWUoJ2F4aXMnLCBub2RlLCB0ZW5zb3JNYXAsIGNvbnRleHQpIGFzIG51bWJlcjtcbiAgICAgICAgICBsZXQgaW5wdXRzID1cbiAgICAgICAgICAgICAgZ2V0UGFyYW1WYWx1ZSgndGVuc29ycycsIG5vZGUsIHRlbnNvck1hcCwgY29udGV4dCkgYXMgVGVuc29yW107XG4gICAgICAgICAgaW5wdXRzID0gaW5wdXRzLnNsaWNlKDAsIG4pO1xuICAgICAgICAgIHJldHVybiBbb3BzLmNvbmNhdChpbnB1dHMsIGF4aXMpXTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdHYXRoZXInOiB7XG4gICAgICAgICAgY29uc3QgaW5wdXQgPSBnZXRQYXJhbVZhbHVlKCd4Jywgbm9kZSwgdGVuc29yTWFwLCBjb250ZXh0KSBhcyBUZW5zb3I7XG4gICAgICAgICAgY29uc3QgaW5kaWNlcyA9XG4gICAgICAgICAgICAgIGdldFBhcmFtVmFsdWUoJ2luZGljZXMnLCBub2RlLCB0ZW5zb3JNYXAsIGNvbnRleHQpIGFzIFRlbnNvcjFEO1xuICAgICAgICAgIHJldHVybiBbb3BzLmdhdGhlcihpbnB1dCwgb3BzLmNhc3QoaW5kaWNlcywgJ2ludDMyJyksIDApXTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdHYXRoZXJWMic6IHtcbiAgICAgICAgICBjb25zdCBheGlzID1cbiAgICAgICAgICAgICAgZ2V0UGFyYW1WYWx1ZSgnYXhpcycsIG5vZGUsIHRlbnNvck1hcCwgY29udGV4dCkgYXMgbnVtYmVyO1xuICAgICAgICAgIGNvbnN0IGJhdGNoRGltcyA9XG4gICAgICAgICAgICAgIGdldFBhcmFtVmFsdWUoJ2JhdGNoRGltcycsIG5vZGUsIHRlbnNvck1hcCwgY29udGV4dCkgYXMgbnVtYmVyO1xuICAgICAgICAgIGNvbnN0IGlucHV0ID0gZ2V0UGFyYW1WYWx1ZSgneCcsIG5vZGUsIHRlbnNvck1hcCwgY29udGV4dCkgYXMgVGVuc29yO1xuICAgICAgICAgIGNvbnN0IGluZGljZXMgPVxuICAgICAgICAgICAgICBnZXRQYXJhbVZhbHVlKCdpbmRpY2VzJywgbm9kZSwgdGVuc29yTWFwLCBjb250ZXh0KSBhcyBUZW5zb3IxRDtcbiAgICAgICAgICByZXR1cm4gW29wcy5nYXRoZXIoXG4gICAgICAgICAgICAgIGlucHV0LCBvcHMuY2FzdChpbmRpY2VzLCAnaW50MzInKSwgYXhpcywgYmF0Y2hEaW1zKV07XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnUmV2ZXJzZSc6IHtcbiAgICAgICAgICBjb25zdCBkaW1zID1cbiAgICAgICAgICAgICAgZ2V0UGFyYW1WYWx1ZSgnZGltcycsIG5vZGUsIHRlbnNvck1hcCwgY29udGV4dCkgYXMgYm9vbGVhbltdO1xuICAgICAgICAgIGNvbnN0IGF4aXMgPSBbXTtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRpbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChkaW1zW2ldKSB7XG4gICAgICAgICAgICAgIGF4aXMucHVzaChpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgaW5wdXQgPSBnZXRQYXJhbVZhbHVlKCd4Jywgbm9kZSwgdGVuc29yTWFwLCBjb250ZXh0KSBhcyBUZW5zb3I7XG4gICAgICAgICAgcmV0dXJuIFtvcHMucmV2ZXJzZShpbnB1dCwgYXhpcyldO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ1JldmVyc2VWMic6IHtcbiAgICAgICAgICBjb25zdCBheGlzID1cbiAgICAgICAgICAgICAgZ2V0UGFyYW1WYWx1ZSgnYXhpcycsIG5vZGUsIHRlbnNvck1hcCwgY29udGV4dCkgYXMgbnVtYmVyW107XG4gICAgICAgICAgY29uc3QgaW5wdXQgPSBnZXRQYXJhbVZhbHVlKCd4Jywgbm9kZSwgdGVuc29yTWFwLCBjb250ZXh0KSBhcyBUZW5zb3I7XG4gICAgICAgICAgcmV0dXJuIFtvcHMucmV2ZXJzZShpbnB1dCwgYXhpcyldO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ1NsaWNlJzoge1xuICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAgICAgICBjb25zdCBiZWdpbiA9IGdldFBhcmFtVmFsdWUoJ2JlZ2luJywgbm9kZSwgdGVuc29yTWFwLCBjb250ZXh0KSBhcyBhbnk7XG4gICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgICAgICAgIGNvbnN0IHNpemUgPSBnZXRQYXJhbVZhbHVlKCdzaXplJywgbm9kZSwgdGVuc29yTWFwLCBjb250ZXh0KSBhcyBhbnk7XG4gICAgICAgICAgcmV0dXJuIFtvcHMuc2xpY2UoXG4gICAgICAgICAgICAgIGdldFBhcmFtVmFsdWUoJ3gnLCBub2RlLCB0ZW5zb3JNYXAsIGNvbnRleHQpIGFzIFRlbnNvciwgYmVnaW4sXG4gICAgICAgICAgICAgIHNpemUpXTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdTdHJpZGVkU2xpY2UnOiB7XG4gICAgICAgICAgY29uc3QgYmVnaW4gPVxuICAgICAgICAgICAgICBnZXRQYXJhbVZhbHVlKCdiZWdpbicsIG5vZGUsIHRlbnNvck1hcCwgY29udGV4dCkgYXMgbnVtYmVyW107XG4gICAgICAgICAgY29uc3QgZW5kID1cbiAgICAgICAgICAgICAgZ2V0UGFyYW1WYWx1ZSgnZW5kJywgbm9kZSwgdGVuc29yTWFwLCBjb250ZXh0KSBhcyBudW1iZXJbXTtcbiAgICAgICAgICBjb25zdCBzdHJpZGVzID1cbiAgICAgICAgICAgICAgZ2V0UGFyYW1WYWx1ZSgnc3RyaWRlcycsIG5vZGUsIHRlbnNvck1hcCwgY29udGV4dCkgYXMgbnVtYmVyW107XG4gICAgICAgICAgY29uc3QgYmVnaW5NYXNrID1cbiAgICAgICAgICAgICAgZ2V0UGFyYW1WYWx1ZSgnYmVnaW5NYXNrJywgbm9kZSwgdGVuc29yTWFwLCBjb250ZXh0KSBhcyBudW1iZXI7XG4gICAgICAgICAgY29uc3QgZW5kTWFzayA9XG4gICAgICAgICAgICAgIGdldFBhcmFtVmFsdWUoJ2VuZE1hc2snLCBub2RlLCB0ZW5zb3JNYXAsIGNvbnRleHQpIGFzIG51bWJlcjtcbiAgICAgICAgICBjb25zdCBlbGxpcHNpc01hc2sgPVxuICAgICAgICAgICAgICBnZXRQYXJhbVZhbHVlKCdlbGxpcHNpc01hc2snLCBub2RlLCB0ZW5zb3JNYXAsIGNvbnRleHQpIGFzIG51bWJlcjtcbiAgICAgICAgICBjb25zdCBuZXdBeGlzTWFzayA9XG4gICAgICAgICAgICAgIGdldFBhcmFtVmFsdWUoJ25ld0F4aXNNYXNrJywgbm9kZSwgdGVuc29yTWFwLCBjb250ZXh0KSBhcyBudW1iZXI7XG4gICAgICAgICAgY29uc3Qgc2hyaW5rQXhpc01hc2sgPVxuICAgICAgICAgICAgICBnZXRQYXJhbVZhbHVlKCdzaHJpbmtBeGlzTWFzaycsIG5vZGUsIHRlbnNvck1hcCwgY29udGV4dCkgYXNcbiAgICAgICAgICAgICAgbnVtYmVyO1xuICAgICAgICAgIGNvbnN0IHRlbnNvciA9IGdldFBhcmFtVmFsdWUoJ3gnLCBub2RlLCB0ZW5zb3JNYXAsIGNvbnRleHQpIGFzIFRlbnNvcjtcblxuICAgICAgICAgIHJldHVybiBbb3BzLnN0cmlkZWRTbGljZShcbiAgICAgICAgICAgICAgdGVuc29yLCBiZWdpbiwgZW5kLCBzdHJpZGVzLCBiZWdpbk1hc2ssIGVuZE1hc2ssIGVsbGlwc2lzTWFzayxcbiAgICAgICAgICAgICAgbmV3QXhpc01hc2ssIHNocmlua0F4aXNNYXNrKV07XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnUGFjayc6IHtcbiAgICAgICAgICByZXR1cm4gdGlkeSgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBheGlzID1cbiAgICAgICAgICAgICAgICBnZXRQYXJhbVZhbHVlKCdheGlzJywgbm9kZSwgdGVuc29yTWFwLCBjb250ZXh0KSBhcyBudW1iZXI7XG4gICAgICAgICAgICBjb25zdCB0ZW5zb3JzID1cbiAgICAgICAgICAgICAgICBnZXRQYXJhbVZhbHVlKCd0ZW5zb3JzJywgbm9kZSwgdGVuc29yTWFwLCBjb250ZXh0KSBhcyBUZW5zb3JbXTtcbiAgICAgICAgICAgIC8vIFJlc2hhcGUgdGhlIHRlbnNvcnMgdG8gdGhlIGZpcnN0IHRlbnNvcidzIHNoYXBlIGlmIHRoZXkgZG9uJ3RcbiAgICAgICAgICAgIC8vIG1hdGNoLlxuICAgICAgICAgICAgY29uc3Qgc2hhcGUgPSB0ZW5zb3JzWzBdLnNoYXBlO1xuICAgICAgICAgICAgY29uc3Qgc3F1ZWV6ZWRTaGFwZSA9IG9wcy5zcXVlZXplKHRlbnNvcnNbMF0pLnNoYXBlO1xuICAgICAgICAgICAgY29uc3QgbWFwcGVkID0gdGVuc29ycy5tYXAodGVuc29yID0+IHtcbiAgICAgICAgICAgICAgY29uc3Qgc2FtZVNoYXBlID0gdXRpbC5hcnJheXNFcXVhbCh0ZW5zb3Iuc2hhcGUsIHNoYXBlKTtcbiAgICAgICAgICAgICAgaWYgKCFzYW1lU2hhcGUgJiZcbiAgICAgICAgICAgICAgICAgICF1dGlsLmFycmF5c0VxdWFsKG9wcy5zcXVlZXplKHRlbnNvcikuc2hhcGUsIHNxdWVlemVkU2hhcGUpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd0aGUgaW5wdXQgdGVuc29ycyBzaGFwZSBkb2VzIG5vdCBtYXRjaCcpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBzYW1lU2hhcGUgPyB0ZW5zb3IgOiBvcHMucmVzaGFwZSh0ZW5zb3IsIHNoYXBlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIFtvcHMuc3RhY2sobWFwcGVkLCBheGlzKV07XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnVW5wYWNrJzoge1xuICAgICAgICAgIGNvbnN0IGF4aXMgPVxuICAgICAgICAgICAgICBnZXRQYXJhbVZhbHVlKCdheGlzJywgbm9kZSwgdGVuc29yTWFwLCBjb250ZXh0KSBhcyBudW1iZXI7XG4gICAgICAgICAgY29uc3QgdGVuc29yID1cbiAgICAgICAgICAgICAgZ2V0UGFyYW1WYWx1ZSgndGVuc29yJywgbm9kZSwgdGVuc29yTWFwLCBjb250ZXh0KSBhcyBUZW5zb3I7XG4gICAgICAgICAgcmV0dXJuIG9wcy51bnN0YWNrKHRlbnNvciwgYXhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnVGlsZSc6IHtcbiAgICAgICAgICBjb25zdCByZXBzID1cbiAgICAgICAgICAgICAgZ2V0UGFyYW1WYWx1ZSgncmVwcycsIG5vZGUsIHRlbnNvck1hcCwgY29udGV4dCkgYXMgbnVtYmVyW107XG4gICAgICAgICAgcmV0dXJuIFtvcHMudGlsZShcbiAgICAgICAgICAgICAgZ2V0UGFyYW1WYWx1ZSgneCcsIG5vZGUsIHRlbnNvck1hcCwgY29udGV4dCkgYXMgVGVuc29yLCByZXBzKV07XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnU3BsaXQnOlxuICAgICAgICBjYXNlICdTcGxpdFYnOiB7XG4gICAgICAgICAgY29uc3QgYXhpcyA9XG4gICAgICAgICAgICAgIGdldFBhcmFtVmFsdWUoJ2F4aXMnLCBub2RlLCB0ZW5zb3JNYXAsIGNvbnRleHQpIGFzIG51bWJlcjtcbiAgICAgICAgICBjb25zdCBudW1PclNpemVTcGxpdHMgPVxuICAgICAgICAgICAgICBnZXRQYXJhbVZhbHVlKCdudW1PclNpemVTcGxpdHMnLCBub2RlLCB0ZW5zb3JNYXAsIGNvbnRleHQpIGFzXG4gICAgICAgICAgICAgICAgICBudW1iZXIgfFxuICAgICAgICAgICAgICBudW1iZXJbXTtcbiAgICAgICAgICBjb25zdCB0ZW5zb3IgPSBnZXRQYXJhbVZhbHVlKCd4Jywgbm9kZSwgdGVuc29yTWFwLCBjb250ZXh0KSBhcyBUZW5zb3I7XG5cbiAgICAgICAgICByZXR1cm4gb3BzLnNwbGl0KHRlbnNvciwgbnVtT3JTaXplU3BsaXRzLCBheGlzKTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdTY2F0dGVyTmQnOiB7XG4gICAgICAgICAgY29uc3QgaW5kaWNlcyA9XG4gICAgICAgICAgICAgIGdldFBhcmFtVmFsdWUoJ2luZGljZXMnLCBub2RlLCB0ZW5zb3JNYXAsIGNvbnRleHQpIGFzIFRlbnNvcjtcbiAgICAgICAgICBjb25zdCB2YWx1ZXMgPVxuICAgICAgICAgICAgICBnZXRQYXJhbVZhbHVlKCd2YWx1ZXMnLCBub2RlLCB0ZW5zb3JNYXAsIGNvbnRleHQpIGFzIFRlbnNvcjtcbiAgICAgICAgICBjb25zdCBzaGFwZSA9XG4gICAgICAgICAgICAgIGdldFBhcmFtVmFsdWUoJ3NoYXBlJywgbm9kZSwgdGVuc29yTWFwLCBjb250ZXh0KSBhcyBudW1iZXJbXTtcbiAgICAgICAgICByZXR1cm4gW29wcy5zY2F0dGVyTkQoaW5kaWNlcywgdmFsdWVzLCBzaGFwZSldO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ0dhdGhlck5kJzoge1xuICAgICAgICAgIGNvbnN0IHggPSBnZXRQYXJhbVZhbHVlKCd4Jywgbm9kZSwgdGVuc29yTWFwLCBjb250ZXh0KSBhcyBUZW5zb3I7XG4gICAgICAgICAgY29uc3QgaW5kaWNlcyA9XG4gICAgICAgICAgICAgIGdldFBhcmFtVmFsdWUoJ2luZGljZXMnLCBub2RlLCB0ZW5zb3JNYXAsIGNvbnRleHQpIGFzIFRlbnNvcjtcbiAgICAgICAgICByZXR1cm4gW29wcy5nYXRoZXJORCh4LCBpbmRpY2VzKV07XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnU3BhcnNlVG9EZW5zZSc6IHtcbiAgICAgICAgICBjb25zdCBpbmRpY2VzID1cbiAgICAgICAgICAgICAgZ2V0UGFyYW1WYWx1ZSgnc3BhcnNlSW5kaWNlcycsIG5vZGUsIHRlbnNvck1hcCwgY29udGV4dCkgYXNcbiAgICAgICAgICAgICAgVGVuc29yO1xuICAgICAgICAgIGNvbnN0IHNoYXBlID1cbiAgICAgICAgICAgICAgZ2V0UGFyYW1WYWx1ZSgnb3V0cHV0U2hhcGUnLCBub2RlLCB0ZW5zb3JNYXAsIGNvbnRleHQpIGFzXG4gICAgICAgICAgICAgIG51bWJlcltdO1xuICAgICAgICAgIGNvbnN0IHNwYXJzZVZhbHVlcyA9XG4gICAgICAgICAgICAgIGdldFBhcmFtVmFsdWUoJ3NwYXJzZVZhbHVlcycsIG5vZGUsIHRlbnNvck1hcCwgY29udGV4dCkgYXMgVGVuc29yO1xuICAgICAgICAgIGNvbnN0IGRlZmF1bHRWYWx1ZSA9XG4gICAgICAgICAgICAgIGdldFBhcmFtVmFsdWUoJ2RlZmF1bHRWYWx1ZScsIG5vZGUsIHRlbnNvck1hcCwgY29udGV4dCkgYXMgU2NhbGFyO1xuICAgICAgICAgIHJldHVybiBbb3BzLnNwYXJzZVRvRGVuc2UoXG4gICAgICAgICAgICAgIGluZGljZXMsIHNwYXJzZVZhbHVlcywgc2hhcGUsXG4gICAgICAgICAgICAgIHNwYXJzZVZhbHVlcy5kdHlwZSA9PT0gZGVmYXVsdFZhbHVlLmR0eXBlID9cbiAgICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZSA6XG4gICAgICAgICAgICAgICAgICBvcHMuY2FzdChkZWZhdWx0VmFsdWUsIHNwYXJzZVZhbHVlcy5kdHlwZSkpXTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdUZW5zb3JTY2F0dGVyVXBkYXRlJzoge1xuICAgICAgICAgIGNvbnN0IGluZGljZXMgPVxuICAgICAgICAgICAgICBnZXRQYXJhbVZhbHVlKCdpbmRpY2VzJywgbm9kZSwgdGVuc29yTWFwLCBjb250ZXh0KSBhcyBUZW5zb3I7XG4gICAgICAgICAgY29uc3QgdmFsdWVzID1cbiAgICAgICAgICAgICAgZ2V0UGFyYW1WYWx1ZSgndmFsdWVzJywgbm9kZSwgdGVuc29yTWFwLCBjb250ZXh0KSBhcyBUZW5zb3I7XG4gICAgICAgICAgY29uc3QgdGVuc29yID1cbiAgICAgICAgICAgICAgZ2V0UGFyYW1WYWx1ZSgndGVuc29yJywgbm9kZSwgdGVuc29yTWFwLCBjb250ZXh0KSBhcyBUZW5zb3I7XG4gICAgICAgICAgcmV0dXJuIFtvcHMudGVuc29yU2NhdHRlclVwZGF0ZSh0ZW5zb3IsIGluZGljZXMsIHZhbHVlcyldO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgVHlwZUVycm9yKGBOb2RlIHR5cGUgJHtub2RlLm9wfSBpcyBub3QgaW1wbGVtZW50ZWRgKTtcbiAgICAgIH1cbiAgICB9O1xuXG5leHBvcnQgY29uc3QgQ0FURUdPUlkgPSAnc2xpY2Vfam9pbic7XG4iXX0=