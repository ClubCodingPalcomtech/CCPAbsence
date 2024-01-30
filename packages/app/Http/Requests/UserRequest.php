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
use App\Http\Validators\PasswordValidationRules;
use App\Models\User;
use Illuminate\Http\File;
use Illuminate\View\View;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpException;

class UserRequest extends Controller
{
    use PasswordValidationRules;
    
    public function create(Request $request)
    {
        $crsfToken = csrf_token();
        $input = $request->all();
        foreach($input as $key=>$value) {
            if ($value=='null') {
                $input[$key] = null;
            }
        }
        if (!isset($input['_token']) || (isset($input['_token']) && $input['_token']!==$crsfToken) || !$request->ajax()) {
            throw new HttpException(500, 'Invalid or Forbidden Access!');
        }
        $input['password_confirmation'] = $input['replypassword'];
        $photo_url = $input['profile_photo_path'];
        if ($photo_url!==null) {
            try {
                $photo_file = file_get_contents($photo_url);
                $file_info = new \finfo(FILEINFO_MIME_TYPE);
                $mime_type = $file_info->buffer(file_get_contents($photo_url));
                switch($mime_type) {
                    case 'image/png':
                        $ext = '.png';
                    break;
                    case 'image/webp':
                        $ext = '.webp';
                    break;
                    case 'image/gif':
                        $ext = '.gif';
                    break;
                    case 'image/svg':
                        $ext = '.svg';
                    break;
                    default:
                        $ext = '.jpg';
                    break;
                }
                $photo_dir = '/assets/uploads/avatars';
                if (!is_dir(public_path($photo_dir))) {
                    mkdir(public_path($photo_dir), 777, true);
                }
                $photo_name = $input['npmid'].$ext;
                $photo_path = $photo_dir.'/'.$photo_name;
                file_put_contents(public_path($photo_path), $photo_file);
                $input['profile_photo_path'] = new File(public_path($photo_path));
                $input['profile_photo_url'] = $photo_path;
            } catch(\Exception $e) {
                $input['profile_photo_path'] = null;
                $input['profile_photo_url'] = null;
            }
        }
        if (!isset($input['remember_token'])) {
            $input['remember_token'] = Str::random(10);
        }
        if (!isset($input['status'])) {
            $input['status'] = true;
        }

        Validator::make($input, [
            'npmid' => ['required', 'numeric', 'min:8', 'unique:users'],
            'fullname' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'alpha_num', 'max:32', 'unique:users'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => $this->passwordRules(),
            'replypassword' => ['required', 'same:password'],
            'profile_photo_path' => ['nullable', 'image', 'mimes:jpg,png,jpeg,gif,svg,webp', 'max:2048'],
            'googleid' => ['nullable', 'numeric', 'min:8', 'unique:users'],
            'facebookid' => ['nullable', 'numeric', 'min:8', 'unique:users'],
            'remember_token' => ['nullable', 'string', 'min:10'],
            'status' => ['boolean'],
            'terms' => ['accepted', 'required']
        ])->validate();

        $user = User::create([
            'npmid' => $input['npmid'],
            'fullname' => $input['fullname'],
            'username' => $input['username'],
            'email' => $input['email'],
            'password' => Hash::make($input['password']),
            'profile_photo_path' => $input['profile_photo_url'] ?? null,
            'googleid' => $input['googleid'],
            'facebookid' => $input['facebookid'],
            'email_verified_at' => now(),
            'remember_token' => $input['remember_token'],
            'status' => $input['status']
        ]);
        if ($user->save()) {
            Auth::login($user, $request->remember);
            return response()->json(['status'=>'OK', 'data'=>$input, 'user'=>$user]);
        }
    }
}