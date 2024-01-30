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

//var faceDetection = import('../vendor/mediapipe/face_detection/face_detection.js');
//console.log(faceDetection);

var mediaSDaiLover = {
    'config': {
        'camera': {
            'video': null,
            'canvas': null,
            'imgContext': null
        },
        'baseUrl': window.location.origin+'/',
        'mobileNetInputWidth': 224,
        'mobileNetInputHeight': 224,
        'isVideoPlaying': false
    },
    'init': function(config)  {
        this.config = Object.assign('{}', this.config, config);
    },
    'isVideoPlaying': function() {
        return this.config.isVideoPlaying;
    },
    'hasGetUserMedia': function() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    },
    'detectDevice': {
        isiOS: function() {
            return /Safari|iPhone|iPad|iPod/i.test(navigator.userAgent);
        },
        isAndroid: function() {
            return /Chrome|Android/i.test(navigator.userAgent);
        },
        isMobile: function() {
            return this.isAndroid() || this.isiOS();
        }          
    },
    'enableCamera': async function(videoPlayer, videoCanvas, callbacks) {
        var $this = this;
        if (!$this.config.camera.video && videoPlayer && videoCanvas) {    
            if (!this.hasGetUserMedia()) {
                callbacks({success:false,error:'Browser API navigator.mediaDevices.getUserMedia not available'});
                return;
            }

            let canvasContext = videoCanvas.getContext('2d');
            $this.config.camera.video = videoPlayer;
            $this.config.camera.canvas = videoCanvas;
            $this.config.camera.imgContext = canvasContext;

            const videoConfig = {
                'audio': false,
                'video': {
                    facingMode: 'user',
                    width: $this.detectDevice.isMobile() ? 360 : 640,
                    height: $this.detectDevice.isMobile() ? 270 : 480,
                    frameRate: { ideal: 60 }
                }
            };

            try {
                navigator.userMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                if (navigator.userMedia) {
                    await navigator.userMedia(videoConfig, function success(mediaStream) {
                            $this.playVideoCamera(mediaStream, callbacks);
                        }, function(errorStream) {
                            callbacks({success:false,error:`The following error occurred: ${errorStream.name}: ${errorStream.message}`});
                        });
                } else if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0) {
                    await navigator.mediaDevices.getUserMedia(videoConfig)
                        .then(function success(mediaStream) {
                            $this.playVideoCamera(mediaStream, callbacks);
                        }).catch(function(errorStream) {
                            callbacks({success:false,error:`The following error occurred: ${errorStream.name}: ${errorStream.message}`});
                        });
                } else {
                    callbacks({success:false,error:'Browser API navigator.mediaDevices.getUserMedia not available'});
                    return;
                }
    
                $this.config.camera.video.addEventListener('play', async function() {
                    $this.drawVideoCamera();
                },false);

            } catch (error) {
                callbacks({success:false,error:`The following error occurred: ${error.name}: ${error.message}`});
                return;
            }

        }
    },
    'drawVideoCamera': async function(){
        var $this = this;
        if ($this.config.camera.video && $this.config.camera.canvas && $this.config.camera.imgContext) {
            if(!$this.detectDevice.isMobile()) {
                if ($this.config.camera.video.paused || $this.config.camera.video.ended) {
                    return;
                }
                $this.config.camera.imgContext.drawImage($this.config.camera.video, 0, 0, $this.config.camera.canvas.width, $this.config.camera.canvas.height);
                var canvasFrame = $this.config.camera.imgContext.getImageData(0, 0, $this.config.camera.canvas.width, $this.config.camera.canvas.height);
                $this.config.camera.imgContext.putImageData(canvasFrame, 0, 0);
                setTimeout(async function() {
                    $this.drawVideoCamera();
                }, 0);
            }
        }
    },
    'playVideoCamera': async function(mediaStream, callbacks){
        var $this = this;
        if ($this.config.camera.video && $this.config.camera.canvas && $this.config.camera.imgContext) {
            $this.config.camera.video.muted = false;
            $this.config.camera.video.srcObject = mediaStream;

            $this.config.camera.video.addEventListener('loadeddata', async function() {
                $this.config.isVideoPlaying = true;
                callbacks({success:true,error:null});
                await new Promise(function(resolve) {
                    resolve($this.config.camera.video);                
                });
            });

            $this.config.camera.video.play();

            $this.config.camera.imgContext.translate($this.config.camera.canvas.width, 0);
            $this.config.camera.imgContext.scale(-1, 1);
        }
    },
    'capturePhoto': async function(canvasPreview, callbacks) {
        var $this = this;
        if (canvasPreview && $this.config.camera.video) {
            if ($this.config.camera.video.readyState < 2) {
                $this.config.camera.video.addEventListener('loadeddata', async function() {
                    await new Promise((resolve) => {
                        resolve($this.config.camera.video);    
                    });
                });
            }
            canvasPreview.getContext('2d').drawImage($this.config.camera.video, 0, 0, canvasPreview.width, canvasPreview.height);
            callbacks({success:true,error:null});
        }
    },
    'loadMobileNetFeatureModel': async function loadMobileNetFeatureModel(callbacks) {
        var $this = this;

        const model = $this.config.baseUrl + 'assets/tfjs-savedmodel/mobilenet_v3_large_1.0_224/model.json';
        $this.config.mobilenet = await tf.loadGraphModel(model); 
        $this.config.mobilenet
        tf.tidy(function () {
            let answer = $this.config.mobilenet.predict(tf.zeros([1, $this.config.mobileNetInputWidth, $this.config.mobileNetInputHeight, 3]));
        });

        callbacks({'statusMessage':'Ready to scan..'})
    }
}