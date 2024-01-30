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
@extends('layouts.main', ['title' => 'Classroom'])

@section('content')
    <div>
        <b-card-group deck>
            <b-row no-gutters>
                <b-col md="4" class="py-3 py-md-0">
                    <b-card header-tag="header" title="Title">
                        <template #header>
                            <h6 class="mb-0"><?= "{{ cardProfileTitle }}" ?></h6>
                        </template>
                        <b-card-text>Header and footers using props.</b-card-text>
                        <b-button href="#" variant="primary">Go somewhere</b-button>
                    </b-card>
                </b-col>
                <b-col md="8" class="py-3 py-md-0">
                    <b-card header-tag="header" title="Title">
                        <template #header>
                            <h6 class="mb-0">Header Slot</h6>
                        </template>
                        <b-card-text>Header and footers using props.</b-card-text>
                        <b-button href="#" variant="primary">Go somewhere</b-button>
                    </b-card>
                </b-col>
            </b-row>
        </b-card-group>
    </div>
@endsection

@section('vuedata'){
    'cardProfileTitle': 'Profile Information'
}@stop