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

use Inertia\Response;
use Inertia\ResponseFactory;
use Illuminate\Support\Traits\Macroable;
use Illuminate\Contracts\Support\Arrayable;

class InertiaResponseFactory extends ResponseFactory
{
    use Macroable;

    /**
     * @param array|Arrayable $props
     */
    public function render(string $component, $props = []): Response
    {
        if ($props instanceof Arrayable) {
            $props = $props->toArray();
        }

        return new InertiaResponse(
            $component,
            array_merge($this->sharedProps, $props),
            $this->rootView,
            $this->getVersion()
        );
    }
}