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

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Facades\InertiaResponseFactory as AppResponseFactory;
use Inertia\ResponseFactory as SupportResponseFactory;

class IntertiaServiceProvider extends ServiceProvider
{
    /**
     * All of the container bindings that should be registered.
     *
     * @var array
     */
    public $bindings = [
        SupportResponseFactory::class => AppResponseFactory::class
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(HandleInertiaRequests::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
