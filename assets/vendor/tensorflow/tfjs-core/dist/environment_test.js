/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
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
import * as environment from './environment';
import { Environment } from './environment';
describe('initializes flags from the url', () => {
    // Silence console.warns for these tests.
    beforeAll(() => spyOn(console, 'warn').and.returnValue(null));
    it('no overrides one registered flag', () => {
        const global = { location: { search: '' } };
        const env = new Environment(global);
        spyOn(env, 'getQueryParams').and.returnValue({});
        env.registerFlag('FLAG1', () => false);
        expect(env.get('FLAG1')).toBe(false);
    });
    it('one unregistered flag', () => {
        const global = { location: { search: '' } };
        const env = new Environment(global);
        spyOn(env, 'getQueryParams').and.returnValue({ 'tfjsflags': 'FLAG1:true' });
        expect(env.features).toEqual({});
    });
    it('one registered flag true', () => {
        const global = { location: { search: '?tfjsflags=FLAG1:true' } };
        const env = new Environment(global);
        env.registerFlag('FLAG1', () => false);
        expect(env.get('FLAG1')).toBe(true);
    });
    it('one registered flag false', () => {
        const global = { location: { search: '?tfjsflags=FLAG1:false' } };
        const env = new Environment(global);
        env.registerFlag('FLAG1', () => true);
        expect(env.get('FLAG1')).toBe(false);
    });
    it('two registered flags', () => {
        const global = { location: { search: '?tfjsflags=FLAG1:true,FLAG2:200' } };
        const env = new Environment(global);
        env.registerFlag('FLAG1', () => false);
        env.registerFlag('FLAG2', () => 100);
        expect(env.get('FLAG1')).toBe(true);
        expect(env.get('FLAG2')).toBe(200);
    });
    it('one registered flag string', () => {
        const global = { location: { search: '?tfjsflags=FLAG1:FlagString' } };
        const env = new Environment(global);
        env.registerFlag('FLAG1', () => 'FlagString');
        expect(env.get('FLAG1')).toBe('FlagString');
        expect(env.get('FLAG1')).not.toBe('flagstring');
    });
    it('one registered flag empty string', () => {
        const global = { location: { search: '?tfjsflags=FLAG1:' } };
        const env = new Environment(global);
        env.registerFlag('FLAG1', () => 'FlagString');
        expect(env.get('FLAG1')).toBe('');
    });
});
describe('flag registration and evaluation', () => {
    it('one flag registered', () => {
        const env = new Environment({});
        const evalObject = { eval: () => true };
        const spy = spyOn(evalObject, 'eval').and.callThrough();
        env.registerFlag('FLAG1', () => evalObject.eval());
        expect(env.get('FLAG1')).toBe(true);
        expect(spy.calls.count()).toBe(1);
        // Multiple calls to get do not call the evaluation function again.
        expect(env.get('FLAG1')).toBe(true);
        expect(spy.calls.count()).toBe(1);
    });
    it('one string flag registered', () => {
        const env = new Environment({});
        env.registerFlag('FLAG1', () => '');
        // Set to a non empty string, this is case sensitive.
        env.set('FLAG1', 'FlagString');
        expect(env.get('FLAG1')).toBe('FlagString');
        expect(env.get('FLAG1')).not.toBe('flagString');
    });
    it('multiple flags registered', () => {
        const env = new Environment({});
        const evalObject = { eval1: () => true, eval2: () => 100 };
        const spy1 = spyOn(evalObject, 'eval1').and.callThrough();
        const spy2 = spyOn(evalObject, 'eval2').and.callThrough();
        env.registerFlag('FLAG1', () => evalObject.eval1());
        env.registerFlag('FLAG2', () => evalObject.eval2());
        expect(env.get('FLAG1')).toBe(true);
        expect(spy1.calls.count()).toBe(1);
        expect(spy2.calls.count()).toBe(0);
        expect(env.get('FLAG2')).toBe(100);
        expect(spy1.calls.count()).toBe(1);
        expect(spy2.calls.count()).toBe(1);
        // Multiple calls to get do not call the evaluation function again.
        expect(env.get('FLAG1')).toBe(true);
        expect(env.get('FLAG2')).toBe(100);
        expect(spy1.calls.count()).toBe(1);
        expect(spy2.calls.count()).toBe(1);
    });
    it('setting overrides value', () => {
        const env = new Environment({});
        const evalObject = { eval: () => true };
        const spy = spyOn(evalObject, 'eval').and.callThrough();
        env.registerFlag('FLAG1', () => evalObject.eval());
        expect(env.get('FLAG1')).toBe(true);
        expect(spy.calls.count()).toBe(1);
        env.set('FLAG1', false);
        expect(env.get('FLAG1')).toBe(false);
        expect(spy.calls.count()).toBe(1);
    });
    it('set hook is called', () => {
        const env = new Environment({});
        const evalObject = { eval: () => true, setHook: () => true };
        const evalSpy = spyOn(evalObject, 'eval').and.callThrough();
        const setHookSpy = spyOn(evalObject, 'setHook').and.callThrough();
        env.registerFlag('FLAG1', () => evalObject.eval(), () => evalObject.setHook());
        expect(env.get('FLAG1')).toBe(true);
        expect(evalSpy.calls.count()).toBe(1);
        expect(setHookSpy.calls.count()).toBe(0);
        env.set('FLAG1', false);
        expect(env.get('FLAG1')).toBe(false);
        expect(evalSpy.calls.count()).toBe(1);
        expect(setHookSpy.calls.count()).toBe(1);
    });
});
describe('environment.getQueryParams', () => {
    it('basic', () => {
        expect(environment.getQueryParams('?a=1&b=hi&f=animal'))
            .toEqual({ 'a': '1', 'b': 'hi', 'f': 'animal' });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnRfdGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RmanMtY29yZS9zcmMvZW52aXJvbm1lbnRfdGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7O0dBZUc7QUFFSCxPQUFPLEtBQUssV0FBVyxNQUFNLGVBQWUsQ0FBQztBQUM3QyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTFDLFFBQVEsQ0FBQyxnQ0FBZ0MsRUFBRSxHQUFHLEVBQUU7SUFDOUMseUNBQXlDO0lBQ3pDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUU5RCxFQUFFLENBQUMsa0NBQWtDLEVBQUUsR0FBRyxFQUFFO1FBQzFDLE1BQU0sTUFBTSxHQUFHLEVBQUMsUUFBUSxFQUFFLEVBQUMsTUFBTSxFQUFFLEVBQUUsRUFBQyxFQUFDLENBQUM7UUFDeEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEMsS0FBSyxDQUFDLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFakQsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdkMsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO1FBQy9CLE1BQU0sTUFBTSxHQUFHLEVBQUMsUUFBUSxFQUFFLEVBQUMsTUFBTSxFQUFFLEVBQUUs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QUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRTFELEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRXBELE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRW5DLG1FQUFtRTtRQUNuRSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyQyxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7UUFDakMsTUFBTSxHQUFHLEdBQUcsSUFBSSxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFaEMsTUFBTSxVQUFVLEdBQUcsRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFDLENBQUM7UUFDdEMsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFeEQsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFFbkQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFbEMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEMsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFO1FBQzVCLE1BQU0sR0FBRyxHQUFHLElBQUksV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRWhDLE1BQU0sVUFBVSxHQUFHLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFDLENBQUM7UUFDM0QsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDNUQsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFbEUsR0FBRyxDQUFDLFlBQVksQ0FDWixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBRWxFLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXpDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNDLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFSCxRQUFRLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxFQUFFO0lBQzFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1FBQ2YsTUFBTSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsb0JBQW9CLENBQUMsQ0FBQzthQUNuRCxPQUFPLENBQUMsRUFBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7SUFDckQsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDE3IEdvb2dsZSBMTEMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cblxuaW1wb3J0ICogYXMgZW52aXJvbm1lbnQgZnJvbSAnLi9lbnZpcm9ubWVudCc7XG5pbXBvcnQge0Vudmlyb25tZW50fSBmcm9tICcuL2Vudmlyb25tZW50JztcblxuZGVzY3JpYmUoJ2luaXRpYWxpemVzIGZsYWdzIGZyb20gdGhlIHVybCcsICgpID0+IHtcbiAgLy8gU2lsZW5jZSBjb25zb2xlLndhcm5zIGZvciB0aGVzZSB0ZXN0cy5cbiAgYmVmb3JlQWxsKCgpID0+IHNweU9uKGNvbnNvbGUsICd3YXJuJykuYW5kLnJldHVyblZhbHVlKG51bGwpKTtcblxuICBpdCgnbm8gb3ZlcnJpZGVzIG9uZSByZWdpc3RlcmVkIGZsYWcnLCAoKSA9PiB7XG4gICAgY29uc3QgZ2xvYmFsID0ge2xvY2F0aW9uOiB7c2VhcmNoOiAnJ319O1xuICAgIGNvbnN0IGVudiA9IG5ldyBFbnZpcm9ubWVudChnbG9iYWwpO1xuICAgIHNweU9uKGVudiwgJ2dldFF1ZXJ5UGFyYW1zJykuYW5kLnJldHVyblZhbHVlKHt9KTtcblxuICAgIGVudi5yZWdpc3RlckZsYWcoJ0ZMQUcxJywgKCkgPT4gZmFsc2UpO1xuICAgIGV4cGVjdChlbnYuZ2V0KCdGTEFHMScpKS50b0JlKGZhbHNlKTtcbiAgfSk7XG5cbiAgaXQoJ29uZSB1bnJlZ2lzdGVyZWQgZmxhZycsICgpID0+IHtcbiAgICBjb25zdCBnbG9iYWwgPSB7bG9jYXRpb246IHtzZWFyY2g6ICcnfX07XG4gICAgY29uc3QgZW52ID0gbmV3IEVudmlyb25tZW50KGdsb2JhbCk7XG4gICAgc3B5T24oZW52LCAnZ2V0UXVlcnlQYXJhbXMnKS5hbmQucmV0dXJuVmFsdWUoeyd0ZmpzZmxhZ3MnOiAnRkxBRzE6dHJ1ZSd9KTtcbiAgICBleHBlY3QoZW52LmZlYXR1cmVzKS50b0VxdWFsKHt9KTtcbiAgfSk7XG5cbiAgaXQoJ29uZSByZWdpc3RlcmVkIGZsYWcgdHJ1ZScsICgpID0+IHtcbiAgICBjb25zdCBnbG9iYWwgPSB7bG9jYXRpb246IHtzZWFyY2g6ICc/dGZqc2ZsYWdzPUZMQUcxOnRydWUnfX07XG4gICAgY29uc3QgZW52ID0gbmV3IEVudmlyb25tZW50KGdsb2JhbCk7XG4gICAgZW52LnJlZ2lzdGVyRmxhZygnRkxBRzEnLCAoKSA9PiBmYWxzZSk7XG5cbiAgICBleHBlY3QoZW52LmdldCgnRkxBRzEnKSkudG9CZSh0cnVlKTtcbiAgfSk7XG5cbiAgaXQoJ29uZSByZWdpc3RlcmVkIGZsYWcgZmFsc2UnLCAoKSA9PiB7XG4gICAgY29uc3QgZ2xvYmFsID0ge2xvY2F0aW9uOiB7c2VhcmNoOiAnP3RmanNmbGFncz1GTEFHMTpmYWxzZSd9fTtcbiAgICBjb25zdCBlbnYgPSBuZXcgRW52aXJvbm1lbnQoZ2xvYmFsKTtcbiAgICBlbnYucmVnaXN0ZXJGbGFnKCdGTEFHMScsICgpID0+IHRydWUpO1xuXG4gICAgZXhwZWN0KGVudi5nZXQoJ0ZMQUcxJykpLnRvQmUoZmFsc2UpO1xuICB9KTtcblxuICBpdCgndHdvIHJlZ2lzdGVyZWQgZmxhZ3MnLCAoKSA9PiB7XG4gICAgY29uc3QgZ2xvYmFsID0ge2xvY2F0aW9uOiB7c2VhcmNoOiAnP3RmanNmbGFncz1GTEFHMTp0cnVlLEZMQUcyOjIwMCd9fTtcbiAgICBjb25zdCBlbnYgPSBuZXcgRW52aXJvbm1lbnQoZ2xvYmFsKTtcbiAgICBlbnYucmVnaXN0ZXJGbGFnKCdGTEFHMScsICgpID0+IGZhbHNlKTtcbiAgICBlbnYucmVnaXN0ZXJGbGFnKCdGTEFHMicsICgpID0+IDEwMCk7XG5cbiAgICBleHBlY3QoZW52LmdldCgnRkxBRzEnKSkudG9CZSh0cnVlKTtcbiAgICBleHBlY3QoZW52LmdldCgnRkxBRzInKSkudG9CZSgyMDApO1xuICB9KTtcblxuICBpdCgnb25lIHJlZ2lzdGVyZWQgZmxhZyBzdHJpbmcnLCAoKSA9PiB7XG4gICAgY29uc3QgZ2xvYmFsID0ge2xvY2F0aW9uOiB7c2VhcmNoOiAnP3RmanNmbGFncz1GTEFHMTpGbGFnU3RyaW5nJ319O1xuICAgIGNvbnN0IGVudiA9IG5ldyBFbnZpcm9ubWVudChnbG9iYWwpO1xuICAgIGVudi5yZWdpc3RlckZsYWcoJ0ZMQUcxJywgKCkgPT4gJ0ZsYWdTdHJpbmcnKTtcblxuICAgIGV4cGVjdChlbnYuZ2V0KCdGTEFHMScpKS50b0JlKCdGbGFnU3RyaW5nJyk7XG4gICAgZXhwZWN0KGVudi5nZXQoJ0ZMQUcxJykpLm5vdC50b0JlKCdmbGFnc3RyaW5nJyk7XG4gIH0pO1xuXG4gIGl0KCdvbmUgcmVnaXN0ZXJlZCBmbGFnIGVtcHR5IHN0cmluZycsICgpID0+IHtcbiAgICBjb25zdCBnbG9iYWwgPSB7bG9jYXRpb246IHtzZWFyY2g6ICc/dGZqc2ZsYWdzPUZMQUcxOid9fTtcbiAgICBjb25zdCBlbnYgPSBuZXcgRW52aXJvbm1lbnQoZ2xvYmFsKTtcbiAgICBlbnYucmVnaXN0ZXJGbGFnKCdGTEFHMScsICgpID0+ICdGbGFnU3RyaW5nJyk7XG5cbiAgICBleHBlY3QoZW52LmdldCgnRkxBRzEnKSkudG9CZSgnJyk7XG4gIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdmbGFnIHJlZ2lzdHJhdGlvbiBhbmQgZXZhbHVhdGlvbicsICgpID0+IHtcbiAgaXQoJ29uZSBmbGFnIHJlZ2lzdGVyZWQnLCAoKSA9PiB7XG4gICAgY29uc3QgZW52ID0gbmV3IEVudmlyb25tZW50KHt9KTtcblxuICAgIGNvbnN0IGV2YWxPYmplY3QgPSB7ZXZhbDogKCkgPT4gdHJ1ZX07XG4gICAgY29uc3Qgc3B5ID0gc3B5T24oZXZhbE9iamVjdCwgJ2V2YWwnKS5hbmQuY2FsbFRocm91Z2goKTtcblxuICAgIGVudi5yZWdpc3RlckZsYWcoJ0ZMQUcxJywgKCkgPT4gZXZhbE9iamVjdC5ldmFsKCkpO1xuXG4gICAgZXhwZWN0KGVudi5nZXQoJ0ZMQUcxJykpLnRvQmUodHJ1ZSk7XG4gICAgZXhwZWN0KHNweS5jYWxscy5jb3VudCgpKS50b0JlKDEpO1xuXG4gICAgLy8gTXVsdGlwbGUgY2FsbHMgdG8gZ2V0IGRvIG5vdCBjYWxsIHRoZSBldmFsdWF0aW9uIGZ1bmN0aW9uIGFnYWluLlxuICAgIGV4cGVjdChlbnYuZ2V0KCdGTEFHMScpKS50b0JlKHRydWUpO1xuICAgIGV4cGVjdChzcHkuY2FsbHMuY291bnQoKSkudG9CZSgxKTtcbiAgfSk7XG5cbiAgaXQoJ29uZSBzdHJpbmcgZmxhZyByZWdpc3RlcmVkJywgKCkgPT4ge1xuICAgIGNvbnN0IGVudiA9IG5ldyBFbnZpcm9ubWVudCh7fSk7XG5cbiAgICBlbnYucmVnaXN0ZXJGbGFnKCdGTEFHMScsICgpID0+ICcnKTtcblxuICAgIC8vIFNldCB0byBhIG5vbiBlbXB0eSBzdHJpbmcsIHRoaXMgaXMgY2FzZSBzZW5zaXRpdmUuXG4gICAgZW52LnNldCgnRkxBRzEnLCAnRmxhZ1N0cmluZycpO1xuICAgIGV4cGVjdChlbnYuZ2V0KCdGTEFHMScpKS50b0JlKCdGbGFnU3RyaW5nJyk7XG4gICAgZXhwZWN0KGVudi5nZXQoJ0ZMQUcxJykpLm5vdC50b0JlKCdmbGFnU3RyaW5nJyk7XG4gIH0pO1xuXG4gIGl0KCdtdWx0aXBsZSBmbGFncyByZWdpc3RlcmVkJywgKCkgPT4ge1xuICAgIGNvbnN0IGVudiA9IG5ldyBFbnZpcm9ubWVudCh7fSk7XG5cbiAgICBjb25zdCBldmFsT2JqZWN0ID0ge2V2YWwxOiAoKSA9PiB0cnVlLCBldmFsMjogKCkgPT4gMTAwfTtcbiAgICBjb25zdCBzcHkxID0gc3B5T24oZXZhbE9iamVjdCwgJ2V2YWwxJykuYW5kLmNhbGxUaHJvdWdoKCk7XG4gICAgY29uc3Qgc3B5MiA9IHNweU9uKGV2YWxPYmplY3QsICdldmFsMicpLmFuZC5jYWxsVGhyb3VnaCgpO1xuXG4gICAgZW52LnJlZ2lzdGVyRmxhZygnRkxBRzEnLCAoKSA9PiBldmFsT2JqZWN0LmV2YWwxKCkpO1xuICAgIGVudi5yZWdpc3RlckZsYWcoJ0ZMQUcyJywgKCkgPT4gZXZhbE9iamVjdC5ldmFsMigpKTtcblxuICAgIGV4cGVjdChlbnYuZ2V0KCdGTEFHMScpKS50b0JlKHRydWUpO1xuICAgIGV4cGVjdChzcHkxLmNhbGxzLmNvdW50KCkpLnRvQmUoMSk7XG4gICAgZXhwZWN0KHNweTIuY2FsbHMuY291bnQoKSkudG9CZSgwKTtcbiAgICBleHBlY3QoZW52LmdldCgnRkxBRzInKSkudG9CZSgxMDApO1xuICAgIGV4cGVjdChzcHkxLmNhbGxzLmNvdW50KCkpLnRvQmUoMSk7XG4gICAgZXhwZWN0KHNweTIuY2FsbHMuY291bnQoKSkudG9CZSgxKTtcblxuICAgIC8vIE11bHRpcGxlIGNhbGxzIHRvIGdldCBkbyBub3QgY2FsbCB0aGUgZXZhbHVhdGlvbiBmdW5jdGlvbiBhZ2Fpbi5cbiAgICBleHBlY3QoZW52LmdldCgnRkxBRzEnKSkudG9CZSh0cnVlKTtcbiAgICBleHBlY3QoZW52LmdldCgnRkxBRzInKSkudG9CZSgxMDApO1xuICAgIGV4cGVjdChzcHkxLmNhbGxzLmNvdW50KCkpLnRvQmUoMSk7XG4gICAgZXhwZWN0KHNweTIuY2FsbHMuY291bnQoKSkudG9CZSgxKTtcbiAgfSk7XG5cbiAgaXQoJ3NldHRpbmcgb3ZlcnJpZGVzIHZhbHVlJywgKCkgPT4ge1xuICAgIGNvbnN0IGVudiA9IG5ldyBFbnZpcm9ubWVudCh7fSk7XG5cbiAgICBjb25zdCBldmFsT2JqZWN0ID0ge2V2YWw6ICgpID0+IHRydWV9O1xuICAgIGNvbnN0IHNweSA9IHNweU9uKGV2YWxPYmplY3QsICdldmFsJykuYW5kLmNhbGxUaHJvdWdoKCk7XG5cbiAgICBlbnYucmVnaXN0ZXJGbGFnKCdGTEFHMScsICgpID0+IGV2YWxPYmplY3QuZXZhbCgpKTtcblxuICAgIGV4cGVjdChlbnYuZ2V0KCdGTEFHMScpKS50b0JlKHRydWUpO1xuICAgIGV4cGVjdChzcHkuY2FsbHMuY291bnQoKSkudG9CZSgxKTtcblxuICAgIGVudi5zZXQoJ0ZMQUcxJywgZmFsc2UpO1xuXG4gICAgZXhwZWN0KGVudi5nZXQoJ0ZMQUcxJykpLnRvQmUoZmFsc2UpO1xuICAgIGV4cGVjdChzcHkuY2FsbHMuY291bnQoKSkudG9CZSgxKTtcbiAgfSk7XG5cbiAgaXQoJ3NldCBob29rIGlzIGNhbGxlZCcsICgpID0+IHtcbiAgICBjb25zdCBlbnYgPSBuZXcgRW52aXJvbm1lbnQoe30pO1xuXG4gICAgY29uc3QgZXZhbE9iamVjdCA9IHtldmFsOiAoKSA9PiB0cnVlLCBzZXRIb29rOiAoKSA9PiB0cnVlfTtcbiAgICBjb25zdCBldmFsU3B5ID0gc3B5T24oZXZhbE9iamVjdCwgJ2V2YWwnKS5hbmQuY2FsbFRocm91Z2goKTtcbiAgICBjb25zdCBzZXRIb29rU3B5ID0gc3B5T24oZXZhbE9iamVjdCwgJ3NldEhvb2snKS5hbmQuY2FsbFRocm91Z2goKTtcblxuICAgIGVudi5yZWdpc3RlckZsYWcoXG4gICAgICAgICdGTEFHMScsICgpID0+IGV2YWxPYmplY3QuZXZhbCgpLCAoKSA9PiBldmFsT2JqZWN0LnNldEhvb2soKSk7XG5cbiAgICBleHBlY3QoZW52LmdldCgnRkxBRzEnKSkudG9CZSh0cnVlKTtcbiAgICBleHBlY3QoZXZhbFNweS5jYWxscy5jb3VudCgpKS50b0JlKDEpO1xuICAgIGV4cGVjdChzZXRIb29rU3B5LmNhbGxzLmNvdW50KCkpLnRvQmUoMCk7XG5cbiAgICBlbnYuc2V0KCdGTEFHMScsIGZhbHNlKTtcblxuICAgIGV4cGVjdChlbnYuZ2V0KCdGTEFHMScpKS50b0JlKGZhbHNlKTtcbiAgICBleHBlY3QoZXZhbFNweS5jYWxscy5jb3VudCgpKS50b0JlKDEpO1xuICAgIGV4cGVjdChzZXRIb29rU3B5LmNhbGxzLmNvdW50KCkpLnRvQmUoMSk7XG4gIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdlbnZpcm9ubWVudC5nZXRRdWVyeVBhcmFtcycsICgpID0+IHtcbiAgaXQoJ2Jhc2ljJywgKCkgPT4ge1xuICAgIGV4cGVjdChlbnZpcm9ubWVudC5nZXRRdWVyeVBhcmFtcygnP2E9MSZiPWhpJmY9YW5pbWFsJykpXG4gICAgICAgIC50b0VxdWFsKHsnYSc6ICcxJywgJ2InOiAnaGknLCAnZic6ICdhbmltYWwnfSk7XG4gIH0pO1xufSk7XG4iXX0=