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

namespace App\Http\Extensions\OpenID;

use Google\Client;
use Google\Service\Oauth2;
use Illuminate\Http\Request;

class GoogleService
{
    private static $googleClient;

    public static function oauth2Client()
    {
        if (self::$googleClient===null) {
            $google = new Client();
            $config = config('google.web');
            $google->setClientId($config['client_id']);
            $google->setClientSecret($config['client_secret']);
            $google->setRedirectUri(config('google.web.redirect_uris') ?? route('openid.google'));
            $google->addScope([
                    Oauth2::USERINFO_EMAIL,
                    Oauth2::USERINFO_PROFILE,
                    Oauth2::OPENID
                ]);
            $google->setIncludeGrantedScopes(true);
            $google->setAccessType("offline");
            self::$googleClient = $google;
        }
        return self::$googleClient;
    }

    public static function closeClient(Request $request)
    {
        if (self::$googleClient!==null)
            self::$googleClient->revokeToken(); 
        $request->session()->pull('oauth.google.access_token', null);
        $request->session()->forget('oauth.google.access_token');
        $request->session()->flush();
        $request->session()->invalidate();
        self::$googleClient=null;
    }
}