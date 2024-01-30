import { convertToTensor } from '../tensor_util_env';
import * as util from '../util';
import { conv2d } from './conv2d';
import * as conv_util from './conv_util';
import { op } from './operation';
import { reshape } from './reshape';
/**
 * Computes a 1D convolution over the input x.
 *
 * @param x The input tensor, of rank 3 or rank 2, of shape
 *     `[batch, width, inChannels]`. If rank 2, batch of 1 is assumed.
 * @param filter The filter, rank 3, of shape
 *     `[filterWidth, inDepth, outDepth]`.
 * @param stride The number of entries by which the filter is moved right at
 *     each step.
 * @param pad The type of padding algorithm.
 *    - `same` and stride 1: output will be of same size as input,
 *       regardless of filter size.
 *    - `valid`: output will be smaller than input if filter is larger
 *       than 1x1.
 *   - For more info, see this guide:
 *     [https://www.tensorflow.org/api_docs/python/tf/nn/convolution](
 *          https://www.tensorflow.org/api_docs/python/tf/nn/convolution)
 * @param dataFormat An optional string from "NWC", "NCW". Defaults to "NWC",
 *     the data is stored in the order of [batch, in_width, in_channels]. Only
 *     "NWC" is currently supported.
 * @param dilation The dilation rate in which we sample input values in
 *     atrous convolution. Defaults to `1`. If it is greater than 1, then
 *     stride must be `1`.
 * @param dimRoundingMode A string from: 'ceil', 'round', 'floor'. If none is
 *     provided, it will default to truncate.
 *
 * @doc {heading: 'Operations', subheading: 'Convolution'}
 */
function conv1d_(x, filter, stride, pad, dataFormat = 'NWC', dilation = 1, dimRoundingMode) {
    const $x = convertToTensor(x, 'x', 'conv1d');
    const $filter = convertToTensor(filter, 'filter', 'conv1d');
    let x3D = $x;
    let reshapedTo3D = false;
    if ($x.rank === 2) {
        reshapedTo3D = true;
        x3D = reshape($x, [1, $x.shape[0], $x.shape[1]]);
    }
    util.assert(x3D.rank === 3, () => `Error in conv1d: input must be rank 3, but got rank ${x3D.rank}.`);
    util.assert($filter.rank === 3, () => `Error in conv1d: filter must be rank 3, but got rank ` +
        `${$filter.rank}.`);
    conv_util.checkPadOnDimRoundingMode('conv1d', pad, dimRoundingMode);
    util.assert(x3D.shape[2] === $filter.shape[1], () => `Error in conv1d: depth of input (${x3D.shape[2]}) must match ` +
        `input depth for filter ${$filter.shape[1]}.`);
    util.assert(conv_util.eitherStridesOrDilationsAreOne(stride, dilation), () => 'Error in conv1D: Either stride or dilation must be 1. ' +
        `Got stride ${stride} and dilation '${dilation}'`);
    util.assert(conv_util.stridesOrDilationsArePositive(dilation), () => 'Error in conv1D: Dilated rates should be larger than 0.');
    util.assert(conv_util.stridesOrDilationsArePositive(stride), () => 'Error in conv1D: Stride should be larger than 0.');
    util.assert(dataFormat === 'NWC', () => `Error in conv1d: got dataFormat of ${dataFormat} but only NWC is currently supported.`);
    const filter4D = reshape($filter, [1, $filter.shape[0], $filter.shape[1], $filter.shape[2]]);
    const input4D = reshape(x3D, [x3D.shape[0], 1, x3D.shape[1], x3D.shape[2]]);
    const strides = [1, stride];
    const dilations = [1, dilation];
    const conv2dDataFormat = 'NHWC';
    const res = conv2d(input4D, filter4D, strides, pad, conv2dDataFormat, dilations, dimRoundingMode);
    if (reshapedTo3D) {
        return reshape(res, [res.shape[2], res.shape[3]]);
    }
    return reshape(res, [res.shape[0], res.shape[2], res.shape[3]]);
}
export const conv1d = /* @__PURE__ */ op({ conv1d_ });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udjFkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vdGZqcy1jb3JlL3NyYy9vcHMvY29udjFkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWlCQSxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFFbkQsT0FBTyxLQUFLLElBQUksTUFBTSxTQUFTLENBQUM7QUFFaEMsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNoQyxPQUFPLEtBQUssU0FBUyxNQUFNLGFBQWEsQ0FBQztBQUN6QyxPQUFPLEVBQUMsRUFBRSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQy9CLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFFbEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTJCRztBQUNILFNBQVMsT0FBTyxDQUNaLENBQWUsRUFBRSxNQUEyQixFQUFFLE1BQWMsRUFDNUQsR0FBb0QsRUFDcEQsYUFBMEIsS0FBSyxFQUFFLFFBQVEsR0FBRyxDQUFDLEVBQzdDLGVBQXdDO0lBQzFDLE1BQU0sRUFBRSxHQUFHLGVBQWUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzdDLE1BQU0sT0FBTyxHQUFHLGVBQWUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBRTVELElBQUksR0FBRyxHQUFHLEVBQWMsQ0FBQztJQUN6QixJQUFJLFlBQVksR0FBRyxLQUFLLENBQUM7SUFDekIsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRTtRQUNqQixZQUFZLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLEdBQUcsR0FBRyxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFD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QUFDLENBQUMsQ0FBTSxDQUFDO0FBQ3ZFLENBQUM7QUFFRCxNQUFNLENBQUMsTUFBTSxNQUFNLEdBQUcsZUFBZSxDQUFDLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAyMCBHb29nbGUgTExDLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5pbXBvcnQge1RlbnNvcjJELCBUZW5zb3IzRCwgVGVuc29yNER9IGZyb20gJy4uL3RlbnNvcic7XG5pbXBvcnQge2NvbnZlcnRUb1RlbnNvcn0gZnJvbSAnLi4vdGVuc29yX3V0aWxfZW52JztcbmltcG9ydCB7VGVuc29yTGlrZX0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtjb252MmR9IGZyb20gJy4vY29udjJkJztcbmltcG9ydCAqIGFzIGNvbnZfdXRpbCBmcm9tICcuL2NvbnZfdXRpbCc7XG5pbXBvcnQge29wfSBmcm9tICcuL29wZXJhdGlvbic7XG5pbXBvcnQge3Jlc2hhcGV9IGZyb20gJy4vcmVzaGFwZSc7XG5cbi8qKlxuICogQ29tcHV0ZXMgYSAxRCBjb252b2x1dGlvbiBvdmVyIHRoZSBpbnB1dCB4LlxuICpcbiAqIEBwYXJhbSB4IFRoZSBpbnB1dCB0ZW5zb3IsIG9mIHJhbmsgMyBvciByYW5rIDIsIG9mIHNoYXBlXG4gKiAgICAgYFtiYXRjaCwgd2lkdGgsIGluQ2hhbm5lbHNdYC4gSWYgcmFuayAyLCBiYXRjaCBvZiAxIGlzIGFzc3VtZWQuXG4gKiBAcGFyYW0gZmlsdGVyIFRoZSBmaWx0ZXIsIHJhbmsgMywgb2Ygc2hhcGVcbiAqICAgICBgW2ZpbHRlcldpZHRoLCBpbkRlcHRoLCBvdXREZXB0aF1gLlxuICogQHBhcmFtIHN0cmlkZSBUaGUgbnVtYmVyIG9mIGVudHJpZXMgYnkgd2hpY2ggdGhlIGZpbHRlciBpcyBtb3ZlZCByaWdodCBhdFxuICogICAgIGVhY2ggc3RlcC5cbiAqIEBwYXJhbSBwYWQgVGhlIHR5cGUgb2YgcGFkZGluZyBhbGdvcml0aG0uXG4gKiAgICAtIGBzYW1lYCBhbmQgc3RyaWRlIDE6IG91dHB1dCB3aWxsIGJlIG9mIHNhbWUgc2l6ZSBhcyBpbnB1dCxcbiAqICAgICAgIHJlZ2FyZGxlc3Mgb2YgZmlsdGVyIHNpemUuXG4gKiAgICAtIGB2YWxpZGA6IG91dHB1dCB3aWxsIGJlIHNtYWxsZXIgdGhhbiBpbnB1dCBpZiBmaWx0ZXIgaXMgbGFyZ2VyXG4gKiAgICAgICB0aGFuIDF4MS5cbiAqICAgLSBGb3IgbW9yZSBpbmZvLCBzZWUgdGhpcyBndWlkZTpcbiAqICAgICBbaHR0cHM6Ly93d3cudGVuc29yZmxvdy5vcmcvYXBpX2RvY3MvcHl0aG9uL3RmL25uL2NvbnZvbHV0aW9uXShcbiAqICAgICAgICAgIGh0dHBzOi8vd3d3LnRlbnNvcmZsb3cub3JnL2FwaV9kb2NzL3B5dGhvbi90Zi9ubi9jb252b2x1dGlvbilcbiAqIEBwYXJhbSBkYXRhRm9ybWF0IEFuIG9wdGlvbmFsIHN0cmluZyBmcm9tIFwiTldDXCIsIFwiTkNXXCIuIERlZmF1bHRzIHRvIFwiTldDXCIsXG4gKiAgICAgdGhlIGRhdGEgaXMgc3RvcmVkIGluIHRoZSBvcmRlciBvZiBbYmF0Y2gsIGluX3dpZHRoLCBpbl9jaGFubmVsc10uIE9ubHlcbiAqICAgICBcIk5XQ1wiIGlzIGN1cnJlbnRseSBzdXBwb3J0ZWQuXG4gKiBAcGFyYW0gZGlsYXRpb24gVGhlIGRpbGF0aW9uIHJhdGUgaW4gd2hpY2ggd2Ugc2FtcGxlIGlucHV0IHZhbHVlcyBpblxuICogICAgIGF0cm91cyBjb252b2x1dGlvbi4gRGVmYXVsdHMgdG8gYDFgLiBJZiBpdCBpcyBncmVhdGVyIHRoYW4gMSwgdGhlblxuICogICAgIHN0cmlkZSBtdXN0IGJlIGAxYC5cbiAqIEBwYXJhbSBkaW1Sb3VuZGluZ01vZGUgQSBzdHJpbmcgZnJvbTogJ2NlaWwnLCAncm91bmQnLCAnZmxvb3InLiBJZiBub25lIGlzXG4gKiAgICAgcHJvdmlkZWQsIGl0IHdpbGwgZGVmYXVsdCB0byB0cnVuY2F0ZS5cbiAqXG4gKiBAZG9jIHtoZWFkaW5nOiAnT3BlcmF0aW9ucycsIHN1YmhlYWRpbmc6ICdDb252b2x1dGlvbid9XG4gKi9cbmZ1bmN0aW9uIGNvbnYxZF88VCBleHRlbmRzIFRlbnNvcjJEfFRlbnNvcjNEPihcbiAgICB4OiBUfFRlbnNvckxpa2UsIGZpbHRlcjogVGVuc29yM0R8VGVuc29yTGlrZSwgc3RyaWRlOiBudW1iZXIsXG4gICAgcGFkOiAndmFsaWQnfCdzYW1lJ3xudW1iZXJ8Y29udl91dGlsLkV4cGxpY2l0UGFkZGluZyxcbiAgICBkYXRhRm9ybWF0OiAnTldDJ3wnTkNXJyA9ICdOV0MnLCBkaWxhdGlvbiA9IDEsXG4gICAgZGltUm91bmRpbmdNb2RlPzogJ2Zsb29yJ3wncm91bmQnfCdjZWlsJyk6IFQge1xuICBjb25zdCAkeCA9IGNvbnZlcnRUb1RlbnNvcih4LCAneCcsICdjb252MWQnKTtcbiAgY29uc3QgJGZpbHRlciA9IGNvbnZlcnRUb1RlbnNvcihmaWx0ZXIsICdmaWx0ZXInLCAnY29udjFkJyk7XG5cbiAgbGV0IHgzRCA9ICR4IGFzIFRlbnNvcjNEO1xuICBsZXQgcmVzaGFwZWRUbzNEID0gZmFsc2U7XG4gIGlmICgkeC5yYW5rID09PSAyKSB7XG4gICAgcmVzaGFwZWRUbzNEID0gdHJ1ZTtcbiAgICB4M0QgPSByZXNoYXBlKCR4LCBbMSwgJHguc2hhcGVbMF0sICR4LnNoYXBlWzFdXSk7XG4gIH1cblxuICB1dGlsLmFzc2VydChcbiAgICAgIHgzRC5yYW5rID09PSAzLFxuICAgICAgKCkgPT4gYEVycm9yIGluIGNvbnYxZDogaW5wdXQgbXVzdCBiZSByYW5rIDMsIGJ1dCBnb3QgcmFuayAke3gzRC5yYW5rfS5gKTtcbiAgdXRpbC5hc3NlcnQoXG4gICAgICAkZmlsdGVyLnJhbmsgPT09IDMsXG4gICAgICAoKSA9PiBgRXJyb3IgaW4gY29udjFkOiBmaWx0ZXIgbXVzdCBiZSByYW5rIDMsIGJ1dCBnb3QgcmFuayBgICtcbiAgICAgICAgICBgJHskZmlsdGVyLnJhbmt9LmApO1xuICBjb252X3V0aWwuY2hlY2tQYWRPbkRpbVJvdW5kaW5nTW9kZSgnY29udjFkJywgcGFkLCBkaW1Sb3VuZGluZ01vZGUpO1xuICB1dGlsLmFzc2VydChcbiAgICAgIHgzRC5zaGFwZVsyXSA9PT0gJGZpbHRlci5zaGFwZVsxXSxcbiAgICAgICgpID0+IGBFcnJvciBpbiBjb252MWQ6IGRlcHRoIG9mIGlucHV0ICgke3gzRC5zaGFwZVsyXX0pIG11c3QgbWF0Y2ggYCArXG4gICAgICAgICAgYGlucHV0IGRlcHRoIGZvciBmaWx0ZXIgJHskZmlsdGVyLnNoYXBlWzFdfS5gKTtcbiAgdXRpbC5hc3NlcnQoXG4gICAgICBjb252X3V0aWwuZWl0aGVyU3RyaWRlc09yRGlsYXRpb25zQXJlT25lKHN0cmlkZSwgZGlsYXRpb24pLFxuICAgICAgKCkgPT4gJ0Vycm9yIGluIGNvbnYxRDogRWl0aGVyIHN0cmlkZSBvciBkaWxhdGlvbiBtdXN0IGJlIDEuICcgK1xuICAgICAgICAgIGBHb3Qgc3RyaWRlICR7c3RyaWRlfSBhbmQgZGlsYXRpb24gJyR7ZGlsYXRpb259J2ApO1xuICB1dGlsLmFzc2VydChcbiAgICAgIGNvbnZfdXRpbC5zdHJpZGVzT3JEaWxhdGlvbnNBcmVQb3NpdGl2ZShkaWxhdGlvbiksXG4gICAgICAoKSA9PiAnRXJyb3IgaW4gY29udjFEOiBEaWxhdGVkIHJhdGVzIHNob3VsZCBiZSBsYXJnZXIgdGhhbiAwLicpO1xuICB1dGlsLmFzc2VydChcbiAgICAgIGNvbnZfdXRpbC5zdHJpZGVzT3JEaWxhdGlvbnNBcmVQb3NpdGl2ZShzdHJpZGUpLFxuICAgICAgKCkgPT4gJ0Vycm9yIGluIGNvbnYxRDogU3RyaWRlIHNob3VsZCBiZSBsYXJnZXIgdGhhbiAwLicpO1xuICB1dGlsLmFzc2VydChcbiAgICAgIGRhdGFGb3JtYXQgPT09ICdOV0MnLFxuICAgICAgKCkgPT4gYEVycm9yIGluIGNvbnYxZDogZ290IGRhdGFGb3JtYXQgb2YgJHtcbiAgICAgICAgICBkYXRhRm9ybWF0fSBidXQgb25seSBOV0MgaXMgY3VycmVudGx5IHN1cHBvcnRlZC5gKTtcblxuICBjb25zdCBmaWx0ZXI0RCA9IHJlc2hhcGUoXG4gICAgICAkZmlsdGVyLCBbMSwgJGZpbHRlci5zaGFwZVswXSwgJGZpbHRlci5zaGFwZVsxXSwgJGZpbHRlci5zaGFwZVsyXV0pO1xuICBjb25zdCBpbnB1dDREID0gcmVzaGFwZSh4M0QsIFt4M0Quc2hhcGVbMF0sIDEsIHgzRC5zaGFwZVsxXSwgeDNELnNoYXBlWzJdXSk7XG4gIGNvbnN0IHN0cmlkZXM6IFtudW1iZXIsIG51bWJlcl0gPSBbMSwgc3RyaWRlXTtcbiAgY29uc3QgZGlsYXRpb25zOiBbbnVtYmVyLCBudW1iZXJdID0gWzEsIGRpbGF0aW9uXTtcblxuICBjb25zdCBjb252MmREYXRhRm9ybWF0ID0gJ05IV0MnO1xuXG4gIGNvbnN0IHJlcyA9IGNvbnYyZChcbiAgICAgIChpbnB1dDREIGFzIFRlbnNvcjREKSwgKGZpbHRlcjREIGFzIFRlbnNvcjREKSwgc3RyaWRlcywgcGFkLFxuICAgICAgY29udjJkRGF0YUZvcm1hdCwgZGlsYXRpb25zLCBkaW1Sb3VuZGluZ01vZGUpO1xuXG4gIGlmIChyZXNoYXBlZFRvM0QpIHtcbiAgICByZXR1cm4gcmVzaGFwZShyZXMsIFtyZXMuc2hhcGVbMl0sIHJlcy5zaGFwZVszXV0pIGFzIFQ7XG4gIH1cblxuICByZXR1cm4gcmVzaGFwZShyZXMsIFtyZXMuc2hhcGVbMF0sIHJlcy5zaGFwZVsyXSwgcmVzLnNoYXBlWzNdXSkgYXMgVDtcbn1cblxuZXhwb3J0IGNvbnN0IGNvbnYxZCA9IC8qIEBfX1BVUkVfXyAqLyBvcCh7Y29udjFkX30pO1xuIl19