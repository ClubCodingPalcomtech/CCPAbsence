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
@php
    $title = [
        503 => '503: Service Unavailable',
        500 => '500: Server Error',
        404 => '404: Page Not Found',
        403 => '403: Forbidden'
    ];
    $description = [
        503 => 'Sorry, we are doing some maintenance. Please check back soon.',
        500 => 'Whoops, something went wrong on our servers.',
        404 => 'Sorry, the page you are looking for could not be found.',
        403 => 'Sorry, you are forbidden from accessing this page.'
    ];
@endphp
@extends('layouts.main', ['title' => ($title[$status] ? $title[$status] : $title[404])])

@section('content')
    <div>
        <h1><?= "{{ title }}" ?></h1>
        <div><?= "{{ description }}" ?></div>
    </div>
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
    title: String,
    description: String,
    status: String
}@endsection

@section('vueboot'){
    this.init();
}@endsection

@section('vuemethod'){
    init: function() {
        this.title = '{{ ($title[$status] ? $title[$status] : $title[404]) }}';
        this.description = '{{ ($description[$status] ? $description[$status] : $description[404]) }}';
        this.status = '{{ $status ?? '404' }}';
    }
}@stop