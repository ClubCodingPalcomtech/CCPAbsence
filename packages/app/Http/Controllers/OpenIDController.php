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

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Extensions\OpenID\GoogleService;
use App\Http\Extensions\OpenID\FacebookService;

class OpenIDController extends Controller
{
    public function google(Request $request)
    {
        $google = GoogleService::oauth2Client();

        if (!$request->session()->has('oauth.google.access_token') && !$request->session()->exists('oauth.google.access_token')) {
            if (!$request->get('code')) {
                return redirect(filter_var($google->createAuthUrl(), FILTER_SANITIZE_URL));
            } else {
                $google->authenticate($request->get('code'));
                $request->session()->put('oauth.google.access_token',$google->getAccessToken());
            }          
        }
    
        if (!$google->getAccessToken())
            $google->setAccessToken($request->session()->get('oauth.google.access_token'));
        return redirect(filter_var(route('api.openid.google').'?token='. csrf_token(), FILTER_SANITIZE_URL));
    }

    public function facebook(Request $request)
    {
        $facebook = FacebookService::oauth2Client();
        if (!$request->get('code')) {
            $authUrl = $facebook->getAuthorizationUrl([
                'scope' => ['email', 'public_profile', 'user_gender', 'user_location', 'user_photos'],
            ]);
            $request->session()->put('oauth.facebook.oauth2state',$facebook->getState());
            return redirect(filter_var($authUrl, FILTER_SANITIZE_URL));        
        } elseif (!$request->get('state') || ($request->get('state') !== $request->session()->get('oauth.facebook.oauth2state'))) {        
            $request->session()->pull('oauth.facebook.oauth2state', null);
            $request->session()->forget('oauth.facebook.oauth2state');
            $request->session()->flush();
            $request->session()->invalidate();
            return redirect(filter_var(route('login'), FILTER_SANITIZE_URL));
        }

        try
        {
            $token = $facebook->getAccessToken('authorization_code', [
                'code' => $request->get('code')
            ]);
            $request->session()->put('oauth.facebook.access_token',$token);
        } catch (\Exception $e) {
            return redirect(filter_var(route('login'), FILTER_SANITIZE_URL));
        }

        return redirect(filter_var(route('api.openid.facebook').'?token='. csrf_token(), FILTER_SANITIZE_URL));        
    }
}