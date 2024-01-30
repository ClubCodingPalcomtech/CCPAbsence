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

namespace App\Http\Facades;

use Inertia\LazyProp;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Traits\Macroable;
use Inertia\Response as SupportResponse;
use Illuminate\Support\Facades\Response as ResponseFactory;

class InertiaResponse extends SupportResponse
{
    use Macroable;

    /**
     * Create an HTTP response that represents the object.
     *
     * @param \Illuminate\Http\Request $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function toResponse($request)
    {
        $only = array_filter(explode(',', $request->header('X-Inertia-Partial-Data', '')));

        $props = ($only && $request->header('X-Inertia-Partial-Component') === $this->component)
            ? Arr::only($this->props, $only)
            : array_filter($this->props, static function ($prop) {
                return ! ($prop instanceof LazyProp);
            });

        $props = $this->resolvePropertyInstances($props, $request);

        $page = [
            'component' => $this->component,
            'props' => $props,
            'url' => $request->fullUrl(),
            'version' => $this->version,
        ];

        if ($request->header('X-Inertia')) {
            return new JsonResponse($page, 200, ['X-Inertia' => 'true']);
        }
        
        return ResponseFactory::view($this->rootView, $this->viewData + ['page' => $page]);
    }
}