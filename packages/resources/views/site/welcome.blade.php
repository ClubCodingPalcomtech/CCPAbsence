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
@extends('layouts.blank', ['title' => 'Welcome to Club Coding Palcomtech'])

@section('content')
    <main>
        <div class="px-4 pt-5 mt-5 mb-3 text-center border-bottom">
            <div class="d-block mx-auto mb-4 brand-logo">
                <app-logo class="logo"></app-logo>
            </div>
            <h2 class="display-4 fw-bold text-body-emphasis">Absence Club</h2>
            <div class="col-lg-6 mx-auto">
                <p class="lead mb-4"><?= "{{ welcomeMessage }}" ?></p>
                <div v-if="canLogin" class="d-grid gap-2 d-sm-flex justify-content-sm-center mb-5">
                    <b-button v-if="authUser" :href="route('dashboard')" variant="primary" size="lg" class="px-4 me-sm-3">Dashboard</b-button>
                    <template v-else>
                        <b-button :href="route('login')" variant="primary" size="lg" class="px-4 me-sm-3">Login</b-button>
                        <b-button v-if="canRegister" :href="route('register')" variant="outline-secondary" size="lg" class="px-4">Register</b-button>
                    </template>
                </div>
            </div>
            <div class="overflow-hidden" style="max-height: 30vh;">
              <div class="container px-5">
                <b-img :src="welcomeBanner" class="img-fluid mx-auto border rounded-3 shadow-lg mb-4" alt="Smart Campus Palcomtech" width="700" height="500" loading="lazy"></b-img>
              </div>
            </div>
        </div>
        <footer class="px-4 pt-0 mt-0 mb-5 text-center text-muted"> &copy; ID {{ date('Y') }} <?= "{{ appAuthor }}" ?>.</footer>
    </main>
@endsection

@section('vuescript')
    @include('components.applogo')
@endsection

@section('vuecomponent')
    Vue.component('app-logo', { template: '#applogo-template' });
@endsection

@section('vuestyle')
   <style>
      .brand-logo > .logo {
         max-width: 240px;
         max-height: 80px;
         margin: 0 auto;
      }
   </style>
@endsection

@section('vueprop'){
    canLogin: Boolean,
    canRegister: Boolean,
    laravelVersion: String,
    phpVersion: String
}@endsection

@section('vueboot'){
    this.init();
}@endsection

@section('vuemethod'){
    init: function() {
        this.canLogin = '{{ $canLogin ? 'true' : 'false' }}';
        this.canRegister = '{{ $canRegister ? 'true' : 'false' }}';
        this.laravelVersion = '{{ $laravelVersion ?? '10.40.0' }}';
        this.phpVersion = '{{ $phpVersion ?? '8.2.14' }}';
    }
}@endsection

@section('vuedata'){
    'welcomeBanner': '{{ asset('/assets/images/absence-preview.jpg') }}',
    'welcomeMessage': 'Welcome and be able to attend with the group, let\'s grow our knowledge and in-depth careers in the field of programming together.'
}@stop