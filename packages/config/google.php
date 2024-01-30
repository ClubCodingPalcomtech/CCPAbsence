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

return [
    'web'=>[
        'client_id'=>'YOUR GOOGLE CLIENT ID',
        'project_id'=>'YOUR GOOGLE PROJECT ID',
        'auth_uri'=>'https://accounts.google.com/o/oauth2/auth',
        'token_uri'=>'https://oauth2.googleapis.com/token',
        'auth_provider_x509_cert_url'=>'https://www.googleapis.com/oauth2/v1/certs',
        'client_secret'=>'YOUR GOOGLE CLIENT SECRET',
        'redirect_uri'=>null
    ],
    'javascript_origins'=>['./']
 ];