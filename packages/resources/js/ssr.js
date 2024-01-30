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

import './bootstrap';
import 'tailwindcss/tailwind.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import 'bootstrap-vue/dist/bootstrap-vue.min.css';
import 'bootstrap-vue/dist/bootstrap-vue-icons.min.css';

import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
//import { VueTailwind } from 'vue-tailwind';

import { createInertiaApp } from '@inertiajs/vue2';
import { createRenderer } from 'vue-server-renderer';
import { InertiaProgress } from '@inertiajs/progress';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { ZiggyVue } from 'ziggy-js';

import Vue from 'vue';
window.Vue = Vue;

const appName = import.meta.env.VITE_APP_NAME || config('app.name');
let app;

createServer((page) =>
    createInertiaApp({
        page,
        render: createRenderer().renderToString,
        title: (title) => `${title} - ${appName}`,
        resolve: (name) => resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob('./Pages/**/*.vue')),
        setup({ App, props, plugin }) {
            app = createSSRApp({ render: () => h(App, props) })
                //.use(VueTailwind)
                .use(plugin)
                .use(BootstrapVue)
                .use(IconsPlugin)
                .use(ZiggyVue, {
                    ...page.props.ziggy,
                    location: new URL(page.props.ziggy.location),
                });
            return app;
        }
    })
);

window.App = app;
InertiaProgress.init({ color: '#4B5563' });