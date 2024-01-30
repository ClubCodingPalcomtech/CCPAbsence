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

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AbsenceController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\OpenIDController;
use App\Http\Requests\UserRequest;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::controller(SiteController::class)->group(function () {
    Route::get('/',  function(SiteController $site) {
        return $site->welcome();
    })->name('welcome');
    Route::get('/dashboard', function(SiteController $site) {
        return $site->dashboard();
    })->name('dashboard');
    Route::get('/login', function(SiteController $site) {
        return $site->login();
    })->name('login');
    Route::get('/register', function(SiteController $site, Request $request) {
        return $site->register($request);
    })->name('register');
    Route::get('/logout', function(SiteController $site, Request $request) {
        return $site->logout($request);
    })->name('logout');
});

Route::controller(AbsenceController::class)->group(function () {
    Route::get('/absence/scanface', function(AbsenceController $absence, Request $request) {
        return $absence->scanFace($request);
    })->name('absence.scanface');
    Route::get('/absence/takerecord', function(AbsenceController $absence, Request $request) {
        return $absence->takeRecord($request);
    })->name('absence.takerecord');
    Route::get('/absence/history', function(AbsenceController $absence, Request $request) {
        return $absence->history($request);
    })->name('absence.history');
});

Route::controller(OpenIDController::class)->group(function () {
    Route::match(['GET', 'POST'], '/openid/google', function(OpenIDController $openid, Request $request) {
        return $openid->google($request);
    })->name('openid.google');
    Route::match(['GET', 'POST'], '/openid/facebook', function(OpenIDController $openid, Request $request) {
        return $openid->facebook($request);
    })->name('openid.facebook');
});

/*
Route::middleware([
    'auth:sanctum',
    'verified',
])->group(function () {
    Route::get('/dashboard', function(SiteController $site) {
        return $site->dashboard();
    })->name('dashboard');
});
*/

/*
Route::get('/{action}', function (string $action) {
    return Inertia::render(ucfirst($action), $_GET ?? []);
});
*/

    /*
Route::get('/', function () {
    if (Auth::check()) {
        return Inertia::render('Dashboard');
    } else {
        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }
})->name('home');

Route::get('login', function () {
    return Inertia::render('Login');
})->name('login');

Route::middleware([
    'auth:sanctum',
    'verified',
])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
});
*/