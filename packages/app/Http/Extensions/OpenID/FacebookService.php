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

use League\OAuth2\Client\Provider\Facebook;
use Illuminate\Http\Request;

class FacebookService
{
    private static $facebookClient;

    public static function oauth2Client()
    {
        if (self::$facebookClient===null) {
            $config = config('facebook');
            $facebook = new Facebook([
                'clientId'          => $config['clientId'],
                'clientSecret'      => $config['clientSecret'],
                'redirectUri'       => config('facebook.redirectUri') ?? route('openid.facebook'),
                'graphApiVersion'   => $config['graphApiVersion']
            ]);
            self::$facebookClient = $facebook;
        }
        return self::$facebookClient;
    }

    public static function closeClient(Request $request)
    {
        $request->session()->pull('oauth.facebook.oauth2state', null);
        $request->session()->forget('oauth.facebook.oauth2state');
        $request->session()->pull('oauth.facebook.access_token', null);
        $request->session()->forget('oauth.facebook.access_token');
        $request->session()->flush();
        $request->session()->invalidate();
        self::$facebookClient=null;
    }
}