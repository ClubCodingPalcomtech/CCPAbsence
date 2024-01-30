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
    'enableCamera': async function(videoPlayer, callbacks) {
        var $this = this;
        if (!$this.config.videoCameraPlayer && videoPlayer) {
            $this.config.videoCameraPlayer = videoPlayer;
            if (this.hasGetUserMedia()) {
                try {
                    navigator.userMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                    if (navigator.userMedia) {
                        await navigator.userMedia({
                                    audio: false,
                                    video: {
                                        width: { min: 1024, ideal: 1280, max: 1920 },
                                        height: { min: 576, ideal: 720, max: 1080 },
                                        facingMode: 'user'                                        
                                    }
                                }, function(mediaStream) {
                                    if (mediaStream) {
                                        videoPlayer.muted = false;
                                        videoPlayer.srcObject = mediaStream;
                                        videoPlayer.disablePictureInPicture = true;
                                        videoPlayer.play();
                                        videoPlayer.addEventListener('loadeddata', function() {
                                            $this.config.isVideoPlaying = true;
                                            callbacks({success:true,error:null});
                                        });
                                    }
                                }, function(errorStream) {
                                    var errMessage = `The following error occurred: ${errorStream.name}`;
                                    console.error(errMessage);
                                    callbacks({success:false,error:errMessage});
                                });
                    } else if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0) {
                        await navigator.mediaDevices.getUserMedia({
                                audio: false,
                                video: {
                                    width: { min: 640, ideal: 1280, max: 1920 },
                                    height: { min: 360, ideal: 800, max: 1080 },
                                    facingMode: 'user'       
                                }
                            }).then(function success(mediaStream) {
                                if (mediaStream) {
                                    videoPlayer.muted = false;
                                    videoPlayer.srcObject = mediaStream;
                                    videoPlayer.disablePictureInPicture = true;
                                    videoPlayer.play();
                                    videoPlayer.addEventListener('loadeddata', function() {
                                        $this.config.isVideoPlaying = true;
                                        callbacks({success:true,error:null});
                                    });
                                }
                            }).catch(function(errorStream) {
                                var errMessage = `The following error occurred: ${errorStream.name}`;
                                console.error(errMessage);
                                callbacks({success:false,error:errMessage});
                            });
                    } else {
                        var errMessage = 'getUserMedia() is not supported by your browser';
                        console.error(errMessage);
                        callbacks({success:false,error:errMessage});
                    }
                } catch (err) {
                    var errMessage = `The following error occurred: ${err.name}: ${err.message}`;
                    console.error(errMessage);
                    callbacks({success:false,error:errMessage});
                }
            } else {
                var errMessage = 'getUserMedia() is not supported by your browser';
                console.error(errMessage);
                callbacks({success:false,error:errMessage});
            }
        }
    },
    'capturePhoto': async function(canvasPreview, callbacks) {
        var $this = this;
        if (canvasPreview && $this.config.videoCameraPlayer) {
            if ($this.config.videoCameraPlayer.readyState < 2) {
                await new Promise((resolve) => {
                    $this.config.videoCameraPlayer.onloadeddata = () => {
                        resolve($this.config.videoCameraPlayer);
                    };
                });
            }
            let faces = null;
            const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
            const detectorConfig = {
                runtime: 'mediapipe', // or mediapipe
                solutionPath: $this.config.baseUrl + 'assets/vendor/mediapipe/face_detection',
                                // or 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection' in cdn.
            }
            var detector = await faceDetection.createDetector(model, detectorConfig);
            try {
                faces = await detector.estimateFaces($this.config.videoCameraPlayer);
            } catch (error) {
                detector.dispose();
                detector = null;
                console.log(error);
            }
            console.log(faces);
            canvasPreview.getContext('2d').drawImage($this.config.videoCameraPlayer, 0, 0, canvasPreview.width, canvasPreview.height);
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