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
?>
<!--//
 - SDaiLover Open Source & Software Development
 -
 - @fullname  : Stephanus Bagus Saputra,
 -              ( 戴 Dai 偉 Wie 峯 Funk )
 - @email     : wiefunk@stephanusdai.web.id
 - @contact   : https://t.me/wiefunkdai
 - @support   : https://opencollective.com/wiefunkdai
 - @link      : https://www.sdailover.web.id,
 -              https://www.stephanusdai.web.id
 - @license   : https://www.sdailover.web.id/license/
 - @copyright : (c) 2023 StephanusDai Developer. All rights reserved.
 - This software using Laravel Framework has released under the terms of the MIT License.
 //-->
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>{{ $title ?? 'Welcome to Club Coding' }} - {{ config('app.name') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet" />

    <!-- Load required Tailwind CSS -->
    <link type="text/css" rel="stylesheet" href="{{ asset('/assets/css/tailwindcss.min.css') }}" />

    <!-- Load required Bootstrap and BootstrapVue CSS -->
    <link type="text/css" rel="stylesheet" href="{{ asset('/assets/vendor/bootstrap/dist/css/bootstrap.min.css') }}" />
    <link type="text/css" rel="stylesheet" href="{{ asset('/assets/vendor/bootstrap-vue/dist/bootstrap-vue.min.css') }}" />

    <!-- Load the following for BootstrapVueIcons support -->
    <link type="text/css" rel="stylesheet" href="{{ asset('/assets/vendor/bootstrap-icons/font/bootstrap-icons.min.css') }}" />

    <!-- Load required Application CSS -->
    <link type="text/css" rel="stylesheet" href="{{ asset('/assets/css/app.css') }}" />
    @yield('vuestyle')
</head>
<body class="font-sans antialiased">
    <div id="ccp-app">
        @yield('content')
    </div>

    <!-- Load required TailwindCSS Script -->
    <script href="{{ asset('/assets/js/tailwindcss.min.js') }}"></script>

    <!-- Load required Bootstrap Script -->
    <script type="text/javascript" src="{{ asset('/assets/vendor/bootstrap/dist/js/bootstrap.min.js') }}"></script>

    <!-- Load Vue followed by BootstrapVue -->
    <script type="module" src="{{ asset('/assets/vendor/vue/dist/vue.min.js') }}"></script>
    <script type="module" src="{{ asset('/assets/vendor/bootstrap-vue/dist/bootstrap-vue.min.js') }}"></script>

    <!-- Load the following for PopperJS support -->
    <script type="module" src="{{ asset('/assets/vendor/popper.js/dist/popper.min.js') }}"></script>

    <!-- Load the following for Axios and AxiosVueJS support -->
    <script type="module" src="{{ asset('/assets/vendor/axios/dist/axios.min.js') }}"></script>
    <script type="module" src="{{ asset('/assets/vendor/vue-axios/dist/vue-axios.common.min.js') }}"></script>

    <!-- Load the following for VeeValidate support -->
    <script type="module" src="{{ asset('/assets/vendor/vee-validate/dist/vee-validate.min.js') }}"></script>

    <!-- Load the following for BootstrapVueIcons support -->
    <script type="module" src="{{ asset('/assets/vendor/bootstrap-vue/dist/bootstrap-vue-icons.min.js') }}"></script>

    <!-- Load required Application Script -->
    <script type="text/javascript" src="{{ asset('/assets/js/app.js') }}"></script>

    @yield('vuescript')

    <script type="module">
        window.axios = axios;
        window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        window.axios.defaults.withCredentials = true;

        window.Vue = Vue;
        window.Vue.use(VeeValidate, {
            inject: true,
            fieldsBagName: 'veeFields',
            errorBagName: 'veeErrors'
        });
        window.Vue.use(VueAxios, window.axios);
        window.Vue.use(BootstrapVue);

        @yield('vuecomponent')

        const app = new window.Vue({
            props: Object.assign({
                    'routes': {
                        'type': Object,
                        'default': {
                            @foreach (Route::getRoutes() as $route)
                                '{{ $route->getName() }}': '{{ $route->uri() }}',
                            @endforeach
                        }
                    },
                    'authUser': {
                        'type': Object,
                        'default': @json(Auth::user())
                    }
                }, @yield('vueprop', '{}')),
            data: function() {
                return Object.assign({
                    'appName': '{{ config('app.name') }}',
                    'appTitle': 'Absence Club Coding Palcomtech',
                    'appAuthor': 'Club Coding Palcomtech'
                }, @yield('vuedata', '{}'));
            },
            computed: @yield('vuecomputed', '{}'),
            methods: Object.assign({
                    route: function(name) {
                        return this.routes[name] ?? name;
                    }
                }, @yield('vuemethod', '{}')),
            mounted: function () {
                @yield('vueboot', '')
            }
        });
        app.$mount('#ccp-app');
        window.App = app;
    </script>
</body>
</html>