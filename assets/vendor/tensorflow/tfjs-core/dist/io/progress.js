/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
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
import { assert } from '../util';
/**
 * Monitor Promise.all progress, fire onProgress callback function.
 *
 * @param promises Promise list going to be monitored
 * @param onProgress Callback function. Fired when a promise resolved.
 * @param startFraction Optional fraction start. Default to 0.
 * @param endFraction Optional fraction end. Default to 1.
 */
export function monitorPromisesProgress(promises, onProgress, startFraction, endFraction) {
    checkPromises(promises);
    startFraction = startFraction == null ? 0 : startFraction;
    endFraction = endFraction == null ? 1 : endFraction;
    checkFraction(startFraction, endFraction);
    let resolvedPromise = 0;
    const registerMonitor = (promise) => {
        promise.then(value => {
            const fraction = startFraction +
                ++resolvedPromise / promises.length * (endFraction - startFraction);
            // pass fraction as parameter to callback function.
            onProgress(fraction);
            return value;
        });
        return promise;
    };
    function checkPromises(promises) {
        assert(promises != null && Array.isArray(promises) && promises.length > 0, () => 'promises must be a none empty array');
    }
    function checkFraction(startFraction, endFraction) {
        assert(startFraction >= 0 && startFraction <= 1, () => `Progress fraction must be in range [0, 1], but ` +
            `got startFraction ${startFraction}`);
        assert(endFraction >= 0 && endFraction <= 1, () => `Progress fraction must be in range [0, 1], but ` +
            `got endFraction ${endFraction}`);
        assert(endFraction >= startFraction, () => `startFraction must be no more than endFraction, but ` +
            `got startFraction ${startFraction} and endFraction ` +
            `${endFraction}`);
    }
    return Promise.all(promises.map(registerMonitor));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3Jlc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi90ZmpzLWNvcmUvc3JjL2lvL3Byb2dyZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFJL0I7Ozs7Ozs7R0FPRztBQUNILE1BQU0sVUFBVSx1QkFBdUIsQ0FDbkMsUUFBMkIsRUFBRSxVQUE4QixFQUMzRCxhQUFzQixFQUFFLFdBQW9CO0lBQzlDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN4QixhQUFhLEdBQUcsYUFBYSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUM7SUFDMUQsV0FBVyxHQUFHLFdBQVcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO0lBQ3BELGFBQWEsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDMUMsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDO0lBRXhCLE1BQU0sZUFBZSxHQUFHLENBQUMsT0FBbUIsRUFBRSxFQUFFO1FBQzlDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDbkIsTUFBTSxRQUFRLEdBQUcsYUFBYTtnQkFDMUIsRUFBRSxlQUFlLEdBQUcsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLFdBQVcsR0FBRyxhQUFhLENBQUMsQ0FBQztZQUN4RSxtREFBbUQ7WUFDbkQsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3JCLE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDLENBQUM7SUFFRixTQUFTLGFBQWEsQ0FBQyxRQUEyQjtRQUNoRCxNQUFNLENBQ0YsUUFBUSxJQUFJLElBQUksSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUNsRSxHQUFHLEVBQUUsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFRCxTQUFTLGFBQWEsQ0FBQyxhQUFxQixFQUFFLFdBQW1CO1FBQy9ELE1BQU0sQ0FDRixhQUFhLElBQUksQ0FBQyxJQUFJLGFBQWEsSUFBSSxDQUFDLEVBQ3hDLEdBQUcsRUFBRSxDQUFDLGlEQUFpRDtZQUNuRCxxQkFBcUIsYUFBYSxFQUFFLENBQUMsQ0FBQztRQUM5QyxNQUFNLENBQ0YsV0FBVyxJQUFJLENBQUMsSUFBSSxXQUFXLElBQUksQ0FBQyxFQUNwQyxHQUFHLEVBQUUsQ0FBQyxpREFBaUQ7WUFDbkQsbUJBQW1CLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDMUMsTUFBTSxDQUNGLFdBQVcsSUFBSSxhQUFhLEVBQzVCLEdBQUcsRUFBRSxDQUFDLHNEQUFzRDtZQUN4RCxxQkFBcUIsYUFBYSxtQkFBbUI7WUFDckQsR0FBRyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO0FBQ3BELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAxOSBHb29nbGUgTExDLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5cbmltcG9ydCB7YXNzZXJ0fSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtPblByb2dyZXNzQ2FsbGJhY2t9IGZyb20gJy4vdHlwZXMnO1xuXG4vKipcbiAqIE1vbml0b3IgUHJvbWlzZS5hbGwgcHJvZ3Jlc3MsIGZpcmUgb25Qcm9ncmVzcyBjYWxsYmFjayBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0gcHJvbWlzZXMgUHJvbWlzZSBsaXN0IGdvaW5nIHRvIGJlIG1vbml0b3JlZFxuICogQHBhcmFtIG9uUHJvZ3Jlc3MgQ2FsbGJhY2sgZnVuY3Rpb24uIEZpcmVkIHdoZW4gYSBwcm9taXNlIHJlc29sdmVkLlxuICogQHBhcmFtIHN0YXJ0RnJhY3Rpb24gT3B0aW9uYWwgZnJhY3Rpb24gc3RhcnQuIERlZmF1bHQgdG8gMC5cbiAqIEBwYXJhbSBlbmRGcmFjdGlvbiBPcHRpb25hbCBmcmFjdGlvbiBlbmQuIERlZmF1bHQgdG8gMS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1vbml0b3JQcm9taXNlc1Byb2dyZXNzPFQ+KFxuICAgIHByb21pc2VzOiBBcnJheTxQcm9taXNlPFQ+Piwgb25Qcm9ncmVzczogT25Qcm9ncmVzc0NhbGxiYWNrLFxuICAgIHN0YXJ0RnJhY3Rpb24/OiBudW1iZXIsIGVuZEZyYWN0aW9uPzogbnVtYmVyKSB7XG4gIGNoZWNrUHJvbWlzZXMocHJvbWlzZXMpO1xuICBzdGFydEZyYWN0aW9uID0gc3RhcnRGcmFjdGlvbiA9PSBudWxsID8gMCA6IHN0YXJ0RnJhY3Rpb247XG4gIGVuZEZyYWN0aW9uID0gZW5kRnJhY3Rpb24gPT0gbnVsbCA/IDEgOiBlbmRGcmFjdGlvbjtcbiAgY2hlY2tGcmFjdGlvbihzdGFydEZyYWN0aW9uLCBlbmRGcmFjdGlvbik7XG4gIGxldCByZXNvbHZlZFByb21pc2UgPSAwO1xuXG4gIGNvbnN0IHJlZ2lzdGVyTW9uaXRvciA9IChwcm9taXNlOiBQcm9taXNlPFQ+KSA9PiB7XG4gICAgcHJvbWlzZS50aGVuKHZhbHVlID0+IHtcbiAgICAgIGNvbnN0IGZyYWN0aW9uID0gc3RhcnRGcmFjdGlvbiArXG4gICAgICAgICAgKytyZXNvbHZlZFByb21pc2UgLyBwcm9taXNlcy5sZW5ndGggKiAoZW5kRnJhY3Rpb24gLSBzdGFydEZyYWN0aW9uKTtcbiAgICAgIC8vIHBhc3MgZnJhY3Rpb24gYXMgcGFyYW1ldGVyIHRvIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICAgb25Qcm9ncmVzcyhmcmFjdGlvbik7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSk7XG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH07XG5cbiAgZnVuY3Rpb24gY2hlY2tQcm9taXNlcyhwcm9taXNlczogQXJyYXk8UHJvbWlzZTxUPj4pOiB2b2lkIHtcbiAgICBhc3NlcnQoXG4gICAgICAgIHByb21pc2VzICE9IG51bGwgJiYgQXJyYXkuaXNBcnJheShwcm9taXNlcykgJiYgcHJvbWlzZXMubGVuZ3RoID4gMCxcbiAgICAgICAgKCkgPT4gJ3Byb21pc2VzIG11c3QgYmUgYSBub25lIGVtcHR5IGFycmF5Jyk7XG4gIH1cblxuICBmdW5jdGlvbiBjaGVja0ZyYWN0aW9uKHN0YXJ0RnJhY3Rpb246IG51bWJlciwgZW5kRnJhY3Rpb246IG51bWJlcik6IHZvaWQge1xuICAgIGFzc2VydChcbiAgICAgICAgc3RhcnRGcmFjdGlvbiA+PSAwICYmIHN0YXJ0RnJhY3Rpb24gPD0gMSxcbiAgICAgICAgKCkgPT4gYFByb2dyZXNzIGZyYWN0aW9uIG11c3QgYmUgaW4gcmFuZ2UgWzAsIDFdLCBidXQgYCArXG4gICAgICAgICAgICBgZ290IHN0YXJ0RnJhY3Rpb24gJHtzdGFydEZyYWN0aW9ufWApO1xuICAgIGFzc2VydChcbiAgICAgICAgZW5kRnJhY3Rpb24gPj0gMCAmJiBlbmRGcmFjdGlvbiA8PSAxLFxuICAgICAgICAoKSA9PiBgUHJvZ3Jlc3MgZnJhY3Rpb24gbXVzdCBiZSBpbiByYW5nZSBbMCwgMV0sIGJ1dCBgICtcbiAgICAgICAgICAgIGBnb3QgZW5kRnJhY3Rpb24gJHtlbmRGcmFjdGlvbn1gKTtcbiAgICBhc3NlcnQoXG4gICAgICAgIGVuZEZyYWN0aW9uID49IHN0YXJ0RnJhY3Rpb24sXG4gICAgICAgICgpID0+IGBzdGFydEZyYWN0aW9uIG11c3QgYmUgbm8gbW9yZSB0aGFuIGVuZEZyYWN0aW9uLCBidXQgYCArXG4gICAgICAgICAgICBgZ290IHN0YXJ0RnJhY3Rpb24gJHtzdGFydEZyYWN0aW9ufSBhbmQgZW5kRnJhY3Rpb24gYCArXG4gICAgICAgICAgICBgJHtlbmRGcmFjdGlvbn1gKTtcbiAgfVxuXG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcy5tYXAocmVnaXN0ZXJNb25pdG9yKSk7XG59XG4iXX0=