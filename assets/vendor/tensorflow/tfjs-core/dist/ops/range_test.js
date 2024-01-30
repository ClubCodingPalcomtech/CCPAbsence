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
import * as tf from '../index';
import { ALL_ENVS, describeWithFlags } from '../jasmine_util';
import { expectArraysEqual } from '../test_util';
describeWithFlags('range', ALL_ENVS, () => {
    it('start stop', async () => {
        const a = tf.range(0, 3);
        expectArraysEqual(await a.data(), [0, 1, 2]);
        expect(a.shape).toEqual([3]);
        const b = tf.range(3, 8);
        expectArraysEqual(await b.data(), [3, 4, 5, 6, 7]);
        expect(b.shape).toEqual([5]);
    });
    it('start stop negative', async () => {
        const a = tf.range(-2, 3);
        expectArraysEqual(await a.data(), [-2, -1, 0, 1, 2]);
        expect(a.shape).toEqual([5]);
        const b = tf.range(4, -2);
        expectArraysEqual(await b.data(), [4, 3, 2, 1, 0, -1]);
        expect(b.shape).toEqual([6]);
    });
    it('start stop step', async () => {
        const a = tf.range(4, 15, 4);
        expectArraysEqual(await a.data(), [4, 8, 12]);
        expect(a.shape).toEqual([3]);
        const b = tf.range(4, 11, 4);
        expectArraysEqual(await b.data(), [4, 8]);
        expect(b.shape).toEqual([2]);
        const c = tf.range(4, 17, 4);
        expectArraysEqual(await c.data(), [4, 8, 12, 16]);
        expect(c.shape).toEqual([4]);
        const d = tf.range(0, 30, 5);
        expectArraysEqual(await d.data(), [0, 5, 10, 15, 20, 25]);
        expect(d.shape).toEqual([6]);
        const e = tf.range(-3, 9, 2);
        expectArraysEqual(await e.data(), [-3, -1, 1, 3, 5, 7]);
        expect(e.shape).toEqual([6]);
        const f = tf.range(3, 3);
        expectArraysEqual(await f.data(), new Float32Array(0));
        expect(f.shape).toEqual([0]);
        const g = tf.range(3, 3, 1);
        expectArraysEqual(await g.data(), new Float32Array(0));
        expect(g.shape).toEqual([0]);
        const h = tf.range(3, 3, 4);
        expectArraysEqual(await h.data(), new Float32Array(0));
        expect(h.shape).toEqual([0]);
        const i = tf.range(-18, -2, 5);
        expectArraysEqual(await i.data(), [-18, -13, -8, -3]);
        expect(i.shape).toEqual([4]);
    });
    it('start stop large step', async () => {
        const a = tf.range(3, 10, 150);
        expectArraysEqual(await a.data(), [3]);
        expect(a.shape).toEqual([1]);
        const b = tf.range(10, 500, 205);
        expectArraysEqual(await b.data(), [10, 215, 420]);
        expect(b.shape).toEqual([3]);
        const c = tf.range(3, -10, -150);
        expectArraysEqual(await c.data(), [3]);
        expect(c.shape).toEqual([1]);
        const d = tf.range(-10, -500, -205);
        expectArraysEqual(await d.data(), [-10, -215, -420]);
        expect(d.shape).toEqual([3]);
    });
    it('start stop negative step', async () => {
        const a = tf.range(0, -10, -1);
        expectArraysEqual(await a.data(), [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]);
        expect(a.shape).toEqual([10]);
        const b = tf.range(0, -10);
        expectArraysEqual(await b.data(), [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]);
        expect(b.shape).toEqual([10]);
        const c = tf.range(3, -4, -2);
        expectArraysEqual(await c.data(), [3, 1, -1, -3]);
        expect(c.shape).toEqual([4]);
        const d = tf.range(-3, -18, -5);
        expectArraysEqual(await d.data(), [-3, -8, -13]);
        expect(d.shape).toEqual([3]);
    });
    it('start stop incompatible step', async () => {
        const a = tf.range(3, 10, -2);
        expectArraysEqual(await a.data(), new Float32Array(0));
        expect(a.shape).toEqual([0]);
        const b = tf.range(40, 3, 2);
        expectArraysEqual(await b.data(), new Float32Array(0));
        expect(b.shape).toEqual([0]);
    });
    it('zero step', () => {
        expect(() => tf.range(2, 10, 0)).toThrow();
    });
    it('should have default dtype', async () => {
        const a = tf.range(1, 4);
        expectArraysEqual(await a.data(), [1, 2, 3]);
        expect(a.dtype).toEqual('float32');
        expect(a.shape).toEqual([3]);
    });
    it('should have float32 dtype', async () => {
        const a = tf.range(1, 4, undefined, 'float32');
        expectArraysEqual(await a.data(), [1, 2, 3]);
        expect(a.dtype).toEqual('float32');
        expect(a.shape).toEqual([3]);
    });
    it('should have int32 dtype', async () => {
        const a = tf.range(1, 4, undefined, 'int32');
        expectArraysEqual(await a.data(), [1, 2, 3]);
        expect(a.dtype).toEqual('int32');
        expect(a.shape).toEqual([3]);
    });
    it('should support large number for int32 dtype', async () => {
        const length = Math.pow(2, 24) + 10;
        const a = tf.range(1, length, 1, 'int32');
        const data = await a.data();
        expect(data[length - 2]).toEqual(length - 1);
        expect(a.dtype).toEqual('int32');
        expect(a.shape).toEqual([length - 1]);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZ2VfdGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3RmanMtY29yZS9zcmMvb3BzL3JhbmdlX3Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBRUgsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDL0IsT0FBTyxFQUFDLFFBQVEsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzVELE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUUvQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRTtJQUN4QyxFQUFFLENBQUMsWUFBWSxFQUFFLEtBQUssSUFBSSxFQUFFO1FBQzFCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU3QixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6QixpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvQixDQUFDLENBQUMsQ0FBQztJQUVI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LE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvQixDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQywyQkFBMkIsRUFBRSxLQUFLLElBQUksRUFBRTtRQUN6QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQy9DLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvQixDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyx5QkFBeUIsRUFBRSxLQUFLLElBQUksRUFBRTtRQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzdDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvQixDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyw2Q0FBNkMsRUFBRSxLQUFLLElBQUksRUFBRTtRQUMzRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDcEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMxQyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM1QixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDN0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDakMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4QyxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMjAgR29vZ2xlIExMQy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5pbXBvcnQgKiBhcyB0ZiBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQge0FMTF9FTlZTLCBkZXNjcmliZVdpdGhGbGFnc30gZnJvbSAnLi4vamFzbWluZV91dGlsJztcbmltcG9ydCB7ZXhwZWN0QXJyYXlzRXF1YWx9IGZyb20gJy4uL3Rlc3RfdXRpbCc7XG5cbmRlc2NyaWJlV2l0aEZsYWdzKCdyYW5nZScsIEFMTF9FTlZTLCAoKSA9PiB7XG4gIGl0KCdzdGFydCBzdG9wJywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGEgPSB0Zi5yYW5nZSgwLCAzKTtcbiAgICBleHBlY3RBcnJheXNFcXVhbChhd2FpdCBhLmRhdGEoKSwgWzAsIDEsIDJdKTtcbiAgICBleHBlY3QoYS5zaGFwZSkudG9FcXVhbChbM10pO1xuXG4gICAgY29uc3QgYiA9IHRmLnJhbmdlKDMsIDgpO1xuICAgIGV4cGVjdEFycmF5c0VxdWFsKGF3YWl0IGIuZGF0YSgpLCBbMywgNCwgNSwgNiwgN10pO1xuICAgIGV4cGVjdChiLnNoYXBlKS50b0VxdWFsKFs1XSk7XG4gIH0pO1xuXG4gIGl0KCdzdGFydCBzdG9wIG5lZ2F0aXZlJywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGEgPSB0Zi5yYW5nZSgtMiwgMyk7XG4gICAgZXhwZWN0QXJyYXlzRXF1YWwoYXdhaXQgYS5kYXRhKCksIFstMiwgLTEsIDAsIDEsIDJdKTtcbiAgICBleHBlY3QoYS5zaGFwZSkudG9FcXVhbChbNV0pO1xuXG4gICAgY29uc3QgYiA9IHRmLnJhbmdlKDQsIC0yKTtcbiAgICBleHBlY3RBcnJheXNFcXVhbChhd2FpdCBiLmRhdGEoKSwgWzQsIDMsIDIsIDEsIDAsIC0xXSk7XG4gICAgZXhwZWN0KGIuc2hhcGUpLnRvRXF1YWwoWzZdKTtcbiAgfSk7XG5cbiAgaXQoJ3N0YXJ0IHN0b3Agc3RlcCcsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBhID0gdGYucmFuZ2UoNCwgMTUsIDQpO1xuICAgIGV4cGVjdEFycmF5c0VxdWFsKGF3YWl0IGEuZGF0YSgpLCBbNCwgOCwgMTJdKTtcbiAgICBleHBlY3QoYS5zaGFwZSkudG9FcXVhbChbM10pO1xuXG4gICAgY29uc3QgYiA9IHRmLnJhbmdlKDQsIDExLCA0KTtcbiAgICBleHBlY3RBcnJheXNFcXVhbChhd2FpdCBiLmRhdGEoKSwgWzQsIDhdKTtcbiAgICBleHBlY3QoYi5zaGFwZSkudG9FcXVhbChbMl0pO1xuXG4gICAgY29uc3QgYyA9IHRmLnJhbmdlKDQsIDE3LCA0KTtcbiAgICBleHBlY3RBcnJheXNFcXVhbChhd2FpdCBjLmRhdGEoKSwgWzQsIDgsIDEyLCAxNl0pO1xuICAgIGV4cGVjdChjLnNoYXBlKS50b0VxdWFsKFs0XSk7XG5cbiAgICBjb25zdCBkID0gdGYucmFuZ2UoMCwgMzAsIDUpO1xuICAgIGV4cGVjdEFycmF5c0VxdWFsKGF3YWl0IGQuZGF0YSgpLCBbMCwgNSwgMTAsIDE1LCAyMCwgMjVdKTtcbiAgICBleHBlY3QoZC5zaGFwZSkudG9FcXVhbChbNl0pO1xuXG4gICAgY29uc3QgZSA9IHRmLnJhbmdlKC0zLCA5LCAyKTtcbiAgICBleHBlY3RBcnJheXNFcXVhbChhd2FpdCBlLmRhdGEoKSwgWy0zLCAtMSwgMSwgMywgNSwgN10pO1xuICAgIGV4cGVjdChlLnNoYXBlKS50b0VxdWFsKFs2XSk7XG5cbiAgICBjb25zdCBmID0gdGYucmFuZ2UoMywgMyk7XG4gICAgZXhwZWN0QXJyYXlzRXF1YWwoYXdhaXQgZi5kYXRhKCksIG5ldyBGbG9hdDMyQXJyYXkoMCkpO1xuICAgIGV4cGVjdChmLnNoYXBlKS50b0VxdWFsKFswXSk7XG5cbiAgICBjb25zdCBnID0gdGYucmFuZ2UoMywgMywgMSk7XG4gICAgZXhwZWN0QXJyYXlzRXF1YWwoYXdhaXQgZy5kYXRhKCksIG5ldyBGbG9hdDMyQXJyYXkoMCkpO1xuICAgIGV4cGVjdChnLnNoYXBlKS50b0VxdWFsKFswXSk7XG5cbiAgICBjb25zdCBoID0gdGYucmFuZ2UoMywgMywgNCk7XG4gICAgZXhwZWN0QXJyYXlzRXF1YWwoYXdhaXQgaC5kYXRhKCksIG5ldyBGbG9hdDMyQXJyYXkoMCkpO1xuICAgIGV4cGVjdChoLnNoYXBlKS50b0VxdWFsKFswXSk7XG5cbiAgICBjb25zdCBpID0gdGYucmFuZ2UoLTE4LCAtMiwgNSk7XG4gICAgZXhwZWN0QXJyYXlzRXF1YWwoYXdhaXQgaS5kYXRhKCksIFstMTgsIC0xMywgLTgsIC0zXSk7XG4gICAgZXhwZWN0KGkuc2hhcGUpLnRvRXF1YWwoWzRdKTtcbiAgfSk7XG5cbiAgaXQoJ3N0YXJ0IHN0b3AgbGFyZ2Ugc3RlcCcsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBhID0gdGYucmFuZ2UoMywgMTAsIDE1MCk7XG4gICAgZXhwZWN0QXJyYXlzRXF1YWwoYXdhaXQgYS5kYXRhKCksIFszXSk7XG4gICAgZXhwZWN0KGEuc2hhcGUpLnRvRXF1YWwoWzFdKTtcblxuICAgIGNvbnN0IGIgPSB0Zi5yYW5nZSgxMCwgNTAwLCAyMDUpO1xuICAgIGV4cGVjdEFycmF5c0VxdWFsKGF3YWl0IGIuZGF0YSgpLCBbMTAsIDIxNSwgNDIwXSk7XG4gICAgZXhwZWN0KGIuc2hhcGUpLnRvRXF1YWwoWzNdKTtcblxuICAgIGNvbnN0IGMgPSB0Zi5yYW5nZSgzLCAtMTAsIC0xNTApO1xuICAgIGV4cGVjdEFycmF5c0VxdWFsKGF3YWl0IGMuZGF0YSgpLCBbM10pO1xuICAgIGV4cGVjdChjLnNoYXBlKS50b0VxdWFsKFsxXSk7XG5cbiAgICBjb25zdCBkID0gdGYucmFuZ2UoLTEwLCAtNTAwLCAtMjA1KTtcbiAgICBleHBlY3RBcnJheXNFcXVhbChhd2FpdCBkLmRhdGEoKSwgWy0xMCwgLTIxNSwgLTQyMF0pO1xuICAgIGV4cGVjdChkLnNoYXBlKS50b0VxdWFsKFszXSk7XG4gIH0pO1xuXG4gIGl0KCdzdGFydCBzdG9wIG5lZ2F0aXZlIHN0ZXAnLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgYSA9IHRmLnJhbmdlKDAsIC0xMCwgLTEpO1xuICAgIGV4cGVjdEFycmF5c0VxdWFsKGF3YWl0IGEuZGF0YSgpLCBbMCwgLTEsIC0yLCAtMywgLTQsIC01LCAtNiwgLTcsIC04LCAtOV0pO1xuICAgIGV4cGVjdChhLnNoYXBlKS50b0VxdWFsKFsxMF0pO1xuXG4gICAgY29uc3QgYiA9IHRmLnJhbmdlKDAsIC0xMCk7XG4gICAgZXhwZWN0QXJyYXlzRXF1YWwoYXdhaXQgYi5kYXRhKCksIFswLCAtMSwgLTIsIC0zLCAtNCwgLTUsIC02LCAtNywgLTgsIC05XSk7XG4gICAgZXhwZWN0KGIuc2hhcGUpLnRvRXF1YWwoWzEwXSk7XG5cbiAgICBjb25zdCBjID0gdGYucmFuZ2UoMywgLTQsIC0yKTtcbiAgICBleHBlY3RBcnJheXNFcXVhbChhd2FpdCBjLmRhdGEoKSwgWzMsIDEsIC0xLCAtM10pO1xuICAgIGV4cGVjdChjLnNoYXBlKS50b0VxdWFsKFs0XSk7XG5cbiAgICBjb25zdCBkID0gdGYucmFuZ2UoLTMsIC0xOCwgLTUpO1xuICAgIGV4cGVjdEFycmF5c0VxdWFsKGF3YWl0IGQuZGF0YSgpLCBbLTMsIC04LCAtMTNdKTtcbiAgICBleHBlY3QoZC5zaGFwZSkudG9FcXVhbChbM10pO1xuICB9KTtcblxuICBpdCgnc3RhcnQgc3RvcCBpbmNvbXBhdGlibGUgc3RlcCcsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBhID0gdGYucmFuZ2UoMywgMTAsIC0yKTtcbiAgICBleHBlY3RBcnJheXNFcXVhbChhd2FpdCBhLmRhdGEoKSwgbmV3IEZsb2F0MzJBcnJheSgwKSk7XG4gICAgZXhwZWN0KGEuc2hhcGUpLnRvRXF1YWwoWzBdKTtcblxuICAgIGNvbnN0IGIgPSB0Zi5yYW5nZSg0MCwgMywgMik7XG4gICAgZXhwZWN0QXJyYXlzRXF1YWwoYXdhaXQgYi5kYXRhKCksIG5ldyBGbG9hdDMyQXJyYXkoMCkpO1xuICAgIGV4cGVjdChiLnNoYXBlKS50b0VxdWFsKFswXSk7XG4gIH0pO1xuXG4gIGl0KCd6ZXJvIHN0ZXAnLCAoKSA9PiB7XG4gICAgZXhwZWN0KCgpID0+IHRmLnJhbmdlKDIsIDEwLCAwKSkudG9UaHJvdygpO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGhhdmUgZGVmYXVsdCBkdHlwZScsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBhID0gdGYucmFuZ2UoMSwgNCk7XG4gICAgZXhwZWN0QXJyYXlzRXF1YWwoYXdhaXQgYS5kYXRhKCksIFsxLCAyLCAzXSk7XG4gICAgZXhwZWN0KGEuZHR5cGUpLnRvRXF1YWwoJ2Zsb2F0MzInKTtcbiAgICBleHBlY3QoYS5zaGFwZSkudG9FcXVhbChbM10pO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGhhdmUgZmxvYXQzMiBkdHlwZScsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBhID0gdGYucmFuZ2UoMSwgNCwgdW5kZWZpbmVkLCAnZmxvYXQzMicpO1xuICAgIGV4cGVjdEFycmF5c0VxdWFsKGF3YWl0IGEuZGF0YSgpLCBbMSwgMiwgM10pO1xuICAgIGV4cGVjdChhLmR0eXBlKS50b0VxdWFsKCdmbG9hdDMyJyk7XG4gICAgZXhwZWN0KGEuc2hhcGUpLnRvRXF1YWwoWzNdKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBoYXZlIGludDMyIGR0eXBlJywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGEgPSB0Zi5yYW5nZSgxLCA0LCB1bmRlZmluZWQsICdpbnQzMicpO1xuICAgIGV4cGVjdEFycmF5c0VxdWFsKGF3YWl0IGEuZGF0YSgpLCBbMSwgMiwgM10pO1xuICAgIGV4cGVjdChhLmR0eXBlKS50b0VxdWFsKCdpbnQzMicpO1xuICAgIGV4cGVjdChhLnNoYXBlKS50b0VxdWFsKFszXSk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgc3VwcG9ydCBsYXJnZSBudW1iZXIgZm9yIGludDMyIGR0eXBlJywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGxlbmd0aCA9IE1hdGgucG93KDIsIDI0KSArIDEwO1xuICAgIGNvbnN0IGEgPSB0Zi5yYW5nZSgxLCBsZW5ndGgsIDEsICdpbnQzMicpO1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBhLmRhdGEoKTtcbiAgICBleHBlY3QoZGF0YVtsZW5ndGggLSAyXSkudG9FcXVhbChsZW5ndGggLSAxKTtcbiAgICBleHBlY3QoYS5kdHlwZSkudG9FcXVhbCgnaW50MzInKTtcbiAgICBleHBlY3QoYS5zaGFwZSkudG9FcXVhbChbbGVuZ3RoIC0gMV0pO1xuICB9KTtcbn0pO1xuIl19