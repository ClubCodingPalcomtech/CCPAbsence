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
import { InertiaProgress } from '@inertiajs/progress';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { ZiggyVue } from 'ziggy-js';

import Vue from 'vue';
window.Vue = Vue;

const appName = import.meta.env.VITE_APP_NAME || config('app.name');

window.$data = {
      'appName': `${appName}`,
      'appTitle': 'Absence Club Coding Palcomtech',
};

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) => resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob('./Pages/**/*.vue')),
  setup({ el, App, props, plugin }) {
    //Vue.use(VueTailwind);
    Vue.use(plugin);
    Vue.use(BootstrapVue);
    Vue.use(IconsPlugin);
    Vue.use(ZiggyVue);

    window.App = new Vue({
            render: h => h(App, props),
          }).$mount(el);
  },
});
InertiaProgress.init({ color: '#4B5563' });