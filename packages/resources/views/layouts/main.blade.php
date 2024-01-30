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
    <link rel="manifest" href="{{ asset('/manifest.json') }}" />

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

    <style type="text/css">
        body {
            /*
            background-image: url('{{ asset('/assets/images/absence-preview.jpg') }}');
            background-repeat: no-repeat;
            background-attachment: fixed;
            background-position: center;
            background-size: cover;
            */
            background-color: #f8f9fa;
        }
        .app-bottomnavbar .nav-active {
            color: #ffa500;
        }    
    </style>
</head>
<body class="font-sans antialiased">
    <div id="ccp-app">
        <main class="col-lg-8 mx-auto pt-3 pt-md-5" style="padding-bottom: 140px">
            <header class="d-flex align-items-center pb-3 mb-5 border-bottom">
                <div class="container">
                    <b-link :href="route('dashboard')" class="d-flex align-items-center justify-content-center text-dark text-decoration-none">
                        <app-logo class="me-2" width="140"></app-logo>
                    </b-link>
                </div>
            </header>
            <div class="container">
                @yield('content')
            </div>
        </main>
        <b-navbar class="bottom-navbar navbar-expand-md navbar-dark fixed-bottom bg-dark">
            <div class="col-lg-8 mx-auto container">
                <div class="d-flex flex-wrap full-width w-100 align-items-center justify-content-center justify-content-lg-start">
                    <b-link :href="route('dashboard')" class="d-flex align-items-center my-2 my-lg-0 me-lg-auto text-white text-decoration-none d-none d-md-flex">
                        <app-logowhite class="logo block h-9 w-auto" style="height: 46px"></app-logowhite>
                    </b-link>
                </div>
                <b-nav class="app-bottomnavbar col-12 col-lg-auto my-2 shadow-lg justify-content-center my-md-0 text-small">
                    <b-nav-item :to="route('dashboard')">
                        <template slot="nav-link" class="d-flex flex-column" :class="currentRoute=='dashboard'?'nav-active':'text-white'">
                            <i class="d-block mx-auto fs-4 bi bi-person-bounding-box"></i>
                            Home
                        </template>
                    </b-nav-item>
                    <b-nav-item :to="route('absence.takerecord')">
                        <template slot="nav-link" class="d-flex flex-column" :class="currentRoute.indexOf('absence')===0?'nav-active':'text-white'">
                            <i class="d-block mx-auto fs-4 bi bi-camera-fill"></i>
                            Absence
                        </template>
                    </b-nav-item>
                    <b-nav-item :to="route('absence.history')">
                        <template slot="nav-link" class="d-flex flex-column" :class="currentRoute=='absence.history'?'nav-active':'text-white'">
                            <i class="d-block mx-auto fs-4 bi bi-calendar-check-fill"></i>
                            History
                        </template>
                    </b-nav-item>
                    <b-nav-item :to="route('logout')">
                        <template slot="nav-link" class="d-flex flex-column text-white">
                            <i class="d-block mx-auto fs-4 bi bi-escape"></i>
                            Logout
                        </template>
                    </b-nav-item>
                </b-nav>
            </div>
        </b-navbar>
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
    
    @include('components.applogo')
    @include('components.applogowhite')

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

        window.Vue.component('app-logo', { template: '#applogo-template' });
        window.Vue.component('app-logowhite', { template: '#applogowhite-template' });

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
                    'appAuthor': 'Club Coding Palcomtech',
                    'baseRoute': '{{ Request::getBaseUrl() }}',
                    'currentRoute': '{{ Route::currentRouteName() }}'
                }, @yield('vuedata', '{}'));
            },
            computed: @yield('vuecomputed', '{}'),
            methods: Object.assign({
                    route: function(name) {
                        return this.baseRoute+'/'+(this.routes[name] ?? name);
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