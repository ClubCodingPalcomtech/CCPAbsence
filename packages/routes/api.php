<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Requests\OpenIDRequest;
use App\Http\Requests\UserRequest;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
})->name('api.auth');

Route::post('/sanctum/token', function (Request $request) { 
    return $request;
})->middleware('sanctum.token')->name('csrf');

Route::middleware('authlogin')->post('/login', function(Request $request) {
    return $request;
})->name('auth.login');

Route::controller(UserRequest::class)->group(function () {
    Route::post('/user/create', function(UserRequest $user, Request $request) {
        return $user->create($request);
    })->name('user.create');
});

Route::controller(OpenIDRequest::class)->group(function () {
    Route::match(['GET', 'POST'], '/openid/google', function(OpenIDRequest $openid, Request $request) {
        return $openid->google($request);
    })->name('api.openid.google');
    Route::match(['GET', 'POST'], '/openid/facebook', function(OpenIDRequest $openid, Request $request) {
        return $openid->facebook($request);
    })->name('api.openid.facebook');
});