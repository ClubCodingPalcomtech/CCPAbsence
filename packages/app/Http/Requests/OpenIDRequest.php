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

namespace App\Http\Requests;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Extensions\OpenID\GoogleService;
use App\Http\Extensions\OpenID\FacebookService;
use Symfony\Component\HttpKernel\Exception\HttpException;

class OpenIDRequest extends Controller
{    
    public function google(Request $request)
    {
        if ($request->token!==csrf_token()) {
            throw new HttpException(500, 'Invalid or Forbidden Access!');
        }
        if ($request->session()->has('oauth.google.access_token') && $request->session()->exists('oauth.google.access_token')) {
            $google = GoogleService::oauth2Client();
            
            if (!$google->getAccessToken())
                $google->setAccessToken($request->session()->get('oauth.google.access_token'));
            $oauth2 = new \Google\Service\Oauth2($google);
            $userProfile = $oauth2->userinfo->get(); 
            $user = User::where('googleid', $userProfile->id)
                    ->orWhere('email', $userProfile->email)
                    ->first();
            if ($user && $user->status) {
                if ($user->googleid===null) {
                    $user->update(['googleid'=>$userProfile->id]);
                }
                if ($user->profile_photo_path===null) {
                    $user->update(['profile_photo_path'=>$userProfile->picture]);
                }
                Auth::login($user, $request->remember);
                return redirect()->to(route('dashboard'));
            } else {
                $newUser = [
                    'googleid' => $userProfile->id,
                    'email' => $userProfile->email,
                    'fullname' => $userProfile->name,
                    'profile_photo_path' => $userProfile->picture,
                ];
                return redirect()->to(route('register'))->withInput($newUser);
            }
        }
        return redirect()->to(route('login'));
    }

    public function facebook(Request $request)
    {       
        if ($request->token!==csrf_token()) {
            throw new HttpException(500, 'Invalid or Forbidden Access!');
        }
        if ($request->session()->has('oauth.facebook.access_token') && $request->session()->exists('oauth.facebook.access_token')) {
            try {
                $facebook = FacebookService::oauth2Client();
                $userProfile = $facebook->getResourceOwner($request->session()->get('oauth.facebook.access_token'));
                $user = User::where('facebookid', $userProfile->getId())
                        ->orWhere('email', $userProfile->getEmail())
                        ->first();
                if ($user && $user->status) {
                    Auth::login($user, $request->remember);
                    return redirect()->to(route('dashboard'));
                } else {
                    $newUser = [
                        'facebookid' => $userProfile->getId(),
                        'email' => $userProfile->getEmail(),
                        'fullname' => $userProfile->getName(),
                        'profile_photo_path' => $userProfile->getPictureUrl(),
                    ];
                    return redirect()->to(route('register'))->withInput($newUser);
                }
            
            } catch (\Exception $e) {
                return redirect()->to(route('login'));
            }
        }
        return redirect()->to(route('login'));
    }
}