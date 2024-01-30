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
@extends('layouts.main', ['title' => 'Scan'])

@section('content')
    <div>
        <b-card-group deck>
            <b-row no-gutters>
                <b-col md="10" class="py-3 mx-auto py-md-0">
                    <b-card header-tag="header" class="capturephoto-form">
                        <template #header>
                            <h6 class="mb-0">Take Photo</h6>
                        </template>
                        <b-overlay :show="cameraLoading" rounded="sm">
                            <div v-if="isCameraError" class="position-relative p-5 text-center text-muted bg-body border border-dashed rounded-5">
                                <svg class="bi mt-5 mx-auto d-block mb-3" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-images" viewBox="0 0 16 16">
                                    <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
                                    <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2M14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1M2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1z"/>
                                </svg>
                                <h1 class="text-body-emphasis">No Camera</h1>
                                <p class="col-lg-6 mx-auto mb-4">
                                    Please activate the camera feature or try using another browser or device that has a camera device.
                                </p>
                                <b-button @click="reloadPage" variant="primary" class="btn btn-primary px-5 mb-5">
                                    Try Again
                                </b-button>
                            </div>
                            <template v-else>
                                <canvas ref="canvascapture" id="canvasImagePhoto" class="canvas-preview" :class="photoCaptured ? 'active' : 'hidden'"></canvas>
                                <div class="canvas-wrapper">
                                    <canvas rel="canvas"></canvas>
                                    <video rel="camera" :show="openVideoCamera()" allow="camera;microphone" autoplay="true" playsinline="" style="
                                        -webkit-transform: scaleX(-1);
                                        transform: scaleX(-1);
                                        visibility: hidden;
                                        width: auto;
                                        height: auto;
                                        " muted>
                                    </video>
                                    <div class="cam-navbar d-inline-block position-absolute w-100">
                                        <div class="cam-overlay-bg position-relative bg-dark bg-opacity-50 w-100"></div>
                                        <b-button @click="capturePhotoCamera" class="btn-takecam position-absolute bg-danger text-center rounded-pill">
                                            <i class="bi bi-record-fill fs-2 text-white fw-bold"></i>
                                        </b-button>
                                    </div>
                                    <div class="cam-statusbar d-inline-block position-absolute w-100">
                                        <div class="cam-overlay-bg position-relative bg-dark bg-opacity-50 w-100"></div>
                                        <p class="cam-caption position-absolute text-white fw-bold">
                                            <?= "{{ canvasStatusMessage }}" ?>
                                        </p>
                                    </div>
                                </div>
                            </template>
                        </b-overlay>
                    </b-card>
                </b-col>
            </b-row>
        </b-card-group>
    </div>
@endsection

@section('vuestyle')
    <style>
        .cam-statusbar {
            top: 0;
            z-index: 1;
        }
        .cam-statusbar .cam-overlay-bg {
            bottom: 0; 
            height: 28px; 
            opacity: 0.5;
        }
        .cam-statusbar .cam-caption {
            z-index: 2;
            display: block;
            text-align: center;
            width: 100%;
            top: 0.5rem;
        }

        .cam-navbar {
            bottom: 0;
            z-index: 1;
        }
        .cam-navbar .cam-overlay-bg {
            bottom: 0; 
            height: 68px; 
            opacity: 0.5;
        }
        .cam-navbar .btn-takecam {
            z-index: 2;
            height: 48px;
            width: 48px;
            top: 50%; 
            left: 50%;
            transform: translate(-50%, -50%);
        }
        .cam-navbar .btn-takecam > * {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }
        .capturephoto-form .canvas-preview.active {
            display: block;
            position: absolute;
            background-color: #000;
            width: 100%;
            height: 100%;
            z-index: 99;
        }
        .capturephoto-form .canvas-preview.hidden {
            display: none;
        }
        video {
            clear: both;
            display: block;
            margin: 0 auto;
            background: #000000;
            width: 100%;
            min-height: 480px;
        }
    </style>
@endsection

@section('vueboot'){
    this.init();
}@endsection

@section('vuemethod'){
    init: function() {
        var $this = this;
        mediaSDaiLover.init({
            'baseUrl': '{{ asset('/') }}'
        });
        this.videoCameraPlayer = this.$refs.camera;
        this.videoCameraCanvas = this.$refs.canvas;
        this.canvasImagePhoto = this.$refs.canvasCapture; 
        mediaSDaiLover.loadMobileNetFeatureModel(function(result) {
            if (result.statusMessage) {
                $this.mediaStatusMessage = result.statusMessage;
            }
        });
    },
    reloadPage() {
        window.location.reload();
    },
    startCameraLoading: function() {
        this.isCameraLoading = true;
    },
    stopCameraLoading: function() {
        this.isCameraLoading = false;
    },
    openVideoCamera: function() {
        var $this = this;
        try {
            mediaSDaiLover.enableCamera(this.videoCameraPlayer, this.videoCameraCanvas, function(result) {
                if (result.success) {
                    $this.stopCameraLoading();
                }
            });
        } catch (err) {
            $this.isCameraError = true;
            $this.stopCameraLoading();
            console.log(err);
        }
    },
    capturePhotoCamera: function() {
        var $this = this;
        $this.canvasImagePhoto = $this.$refs.canvas; 
        mediaSDaiLover.capturePhoto($this.canvasImagePhoto, function(result) {
            if (result.success) {
                $this.isPhotoCaptured = true;
                setTimeout(function() {
                    $this.isPhotoCaptured = false;
                    $this.startCameraLoading();
                    setTimeout(function() {
                        $this.stopCameraLoading();
                    }, 1000);
                }, 3000);
            }
        });
    }
}@endsection

@section('vuecomputed'){
    photoCaptured: function() {
        return this.isPhotoCaptured;
    },
    cameraLoading: function() {
        return this.isCameraLoading;
    },
    canvasStatusMessage: function() {
        return this.mediaStatusMessage ?? '';
    }
}@endsection

@section('vuescript')
    <script type="module" src="{{ asset('/assets/vendor/tensorflow/tfjs/dist/tf.min.js') }}"></script>
    <script src="{{ asset('/assets/vendor/mediapipe/face_detection/face_detection.js') }}"></script>
    <script src="{{ asset('/assets/vendor/tensorflow-models/face-detection/dist/face-detection.min.js') }}"></script>
    <script src="{{ asset('/assets/vendor/tensorflow-models/mobilenet/dist/mobilenet.min.js') }}"> </script>
    <script type="text/javascript" src="{{ asset('/assets/js/app.media.js') }}"></script>
@endsection

@section('vuedata'){
    'isPhotoCaptured': false,
    'isCameraLoading': true,
    'isCameraError': false,
    'videoCameraPlayer': null,
    'videoCameraCanvas': null,
    'canvasImagePhoto': null,
    'mediaStatusMessage': null,
    'cardProfileTitle': 'Profile Information'
}@stop