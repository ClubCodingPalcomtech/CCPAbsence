<?php
/**
 * SDaiLover Open Source & Software Development
 *
 * @fullname  : Stephanus Bagus Saputra,
 *              ( 戴 Dai 偉 Wie 峯 Funk )
 * @email     : wiefunk@stephanusdai.web.id
 * @contact   : https://t.me/wiefunkdai
 * @support   : https://opencollective.com/wiefunkdai
 * @link      : https://www.sdailover.web.id,
 *              https://www.stephanusdai.web.id
 * @license   : https://www.sdailover.web.id/license/
 * @copyright : (c) 2023 StephanusDai Developer. All rights reserved.
 * This software using Laravel Framework has released under the terms of the MIT License.
 */

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class LoginAuthenticate
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next) { 
        if ($request->_token!==csrf_token()) {
            throw new HttpException(500, 'Invalid or Forbidden Access!');
        }

        $user = User::where('email', $request->authid)
                    ->orWhere('npmid', $request->authid)
                    ->orWhere('username', $request->authid)
                    ->first();

        if ($user) {
            if ($user->status && Hash::check($request->password, $user->password)) {
                Auth::login($user, $request->remember);
                return response()->json(['status'=>'OK']);
            } else if ($user->status==false) {
                throw ValidationException::withMessages([
                    'authid' => "Account has been suspend!"
                ]);
            } else {
                throw ValidationException::withMessages([
                    'password' => "Password not entered correctly!"
                ]);
            }
        } else {
            throw ValidationException::withMessages([
                'authid' => "Username is not available!",
                'password' => "Password not entered correctly!"
            ]);
        }

        return $next($request); 
    }
     
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        return $request->expectsJson() ? null : route('login');
    }
}