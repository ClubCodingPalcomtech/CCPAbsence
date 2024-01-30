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

namespace App\Http\Controllers;

use Illuminate\View\View;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use App\Http\Extensions\OpenID\GoogleService;
use App\Http\Extensions\OpenID\FacebookService;
use Inertia\Inertia;

class SiteController extends Controller
{
    public function welcome()
    {
        if (Auth::check()) {
            return redirect('dashboard');
        }
        return view('site.welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
        /*
        return Inertia::render('Welcome', [
            'authUser' => Auth::user(),
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
        */
    }

    public function dashboard()
    {
        if (!Auth::check()) {
            return redirect('login');
        }
        
        return view('site.dashboard');
    }

    public function register(Request $request)
    {
        if (Auth::check()) {
            return redirect('dashboard');
        }
        
        if ($request->session()->getOldInput()) {
            $inputs = $request->session()->getOldInput();
            $post = array_merge([
                'googleid' => null,
                'facebookid' => null,
                'npmid' => null,
                'fullname' => null,
                'email' => null,
                'username' => null,
                'password' => null,
                'replypassword' => null,
                'profile_photo_path' => null,
                'terms' => false    
            ], $inputs);
        }

        return view('site.register', [
            'postForm' => isset($post) ? json_encode($post) : null,
            'urlOpenIDGoogle' => route('openid.google'),
            'urlOpenIDFacebook' => route('openid.facebook'),
            'canLogin' => Route::has('login')
        ]);
    }

    public function login()
    {
        if (Auth::check()) {
            return redirect('dashboard');
        }
        return view('site.login', [
            'authUser' => json_encode(Auth::user()),
            'urlOpenIDGoogle' => route('openid.google'),
            'urlOpenIDFacebook' => route('openid.facebook'),
            'canRegister' => Route::has('register')
        ]);
    }

    public function logout(Request $request)
    {
        GoogleService::closeClient($request);
        FacebookService::closeClient($request);
        Auth::logout();        
        return redirect(route('welcome'));
    }
}