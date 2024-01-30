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
@extends('layouts.auth', ['title' => 'Register Club'])

@section('content')
    <b-card-body class="p-md-5 mx-md-4">
        <div class="text-center">
            <a class="d-block mx-auto brand-logo" :href="route('welcome')">
                <app-logo class="logo"></app-logo>
            </a>
            <h4 class="fw-bold mt-3 mb-3 pb-2">Club Form Registration</h4>
        </div>
        <div class="d-grid gap-2 d-md-flex justify-content-center mb-4">
            <b-button v-if="canLogin" :href="route('login')" variant="outline-secondary" size="sm" class="px-4 me-md-2 fw-bold">Login</b-button>
            <b-button href="#" variant="primary" size="sm" class="px-4 fw-bold">Register</b-button>
        </div>
        <div v-if="post.googleid || post.facebookid" class="text-center mb-3 border-bottom pb-3">
            <p class="text-muted">Register with account:</p>
            <b-icon :icon="post.googleid ? 'google' : 'facebook'" class="fs-2 text-primary"></b-icon>
            <p class="mt-2 mb-0 fw-bold"><?= "{{ (post.googleid || post.facebookid) || '00000' }}" ?></p>
        </div>
        <b-form @submit.stop.prevent="onRegisterSubmit" method="post" class="mt-3" enctype="multipart/form-data">
            <input type="hidden" name="_token" :value="csrfToken" />
            <input type="hidden" name="googleid" :value="post.googleid" />
            <input type="hidden" name="facebookid" :value="post.facebookid" />
            <input type="hidden" name="profile_photo_path" @change="onProfileAvatar" :value="post.profile_photo_path" />
            <b-form-group id="input-npmid-group" label="NPM ID">
                <div class="input-group flex-nowrap">
                    <span class="input-group-text"><i class="bi bi-person-vcard"></i></span>
                    <b-form-input v-model="post.npmid" type="text" name="npmid" id="input-npmid" v-validate="'numeric|required:true|min:8'" :state="validateState('npmid')" placeholder="NPM ID" autofocus></b-form-input>
                </div>
                <b-form-invalid-feedback :state="npmidErrorState"><?= "{{ npmidErrorMessage }}" ?></b-form-invalid-feedback>
            </b-form-group>
            <b-form-group id="input-fullname-group" label="Full Name" class="mt-4">
                <div class="input-group flex-nowrap">
                    <span class="input-group-text"><i class="bi bi-file-earmark-person"></i></span>
                    <b-form-input v-model="post.fullname" type="text" name="fullname" id="input-fullname" v-validate="{ required: true, min: 4 }" :state="validateState('fullname')" placeholder="Full Name"></b-form-input>
                </div>
                <b-form-invalid-feedback :state="fullnameErrorState"><?= "{{ fullnameErrorMessage }}" ?></b-form-invalid-feedback>
            </b-form-group>
            <b-form-group id="input-email-group" label="Email" class="mt-4">
                <div class="input-group flex-nowrap">
                    <span class="input-group-text"><i class="bi bi-envelope-at-fill"></i></span>
                    <b-form-input v-model="post.email" type="email" name="email" id="input-email" v-validate="'email|required:true|min:4'" :state="validateState('email')" placeholder="Email"></b-form-input>
                </div>
                <b-form-invalid-feedback :state="emailErrorState"><?= "{{ emailErrorMessage }}" ?></b-form-invalid-feedback>
            </b-form-group>
            <b-form-group id="input-username-group" label="Username" class="mt-4">
                <div class="input-group flex-nowrap">
                    <span class="input-group-text"><i class="bi bi-person-fill"></i></span>
                    <b-form-input v-model="post.username" type="text" name="username" id="input-username" v-validate="'alpha_num|required:true|min:4'" :state="validateState('username')" placeholder="Username"></b-form-input>
                </div>
                <b-form-invalid-feedback :state="usernameErrorState"><?= "{{ usernameErrorMessage }}" ?></b-form-invalid-feedback>
            </b-form-group>
            <b-form-group id="input-password-group" label="Security Password" class="mt-4">
                <div class="input-group flex-nowrap">
                    <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
                    <b-form-input v-model="post.password" :type="showPassword ? 'text' : 'password'" name="password" id="input-password" v-validate="{ required: true, min: 6 }" :state="validateState('password')" aria-describedby="input-password-feedback" placeholder="Password"></b-form-input>
                    <b-button variant="outline-input" class="border-gray-300" @click="togglePassView"><i class="bi" :class="{ 'bi-eye-slash-fill': showPassword, 'bi-eye-fill': !showPassword }"></i></b-button>
                </div>
                <b-form-invalid-feedback :state="passwordErrorState"><?= "{{ passwordErrorMessage }}" ?></b-form-invalid-feedback>
            </b-form-group>
            <b-form-group id="input-replypassword-group" label="Reply Password" class="mt-4">
                <div class="input-group flex-nowrap">
                    <span class="input-group-text"><i class="bi bi-shield-fill-check"></i></span>
                    <b-form-input v-model="post.replypassword" :type="showReplyPassword ? 'text' : 'password'" name="replypassword" id="input-replypassword" v-validate="{ required: true, min: 6, is: post.password }" :state="validateState('replypassword')" aria-describedby="input-replypassword-feedback" placeholder="Reply Password"></b-form-input>
                    <b-button variant="outline-input" class="border-gray-300" @click="toggleRePassView"><i class="bi" :class="{ 'bi-eye-slash-fill': showReplyPassword, 'bi-eye-fill': !showReplyPassword }"></i></b-button>
                </div>
                <b-form-invalid-feedback :state="replypasswordErrorState"><?= "{{ replypasswordErrorMessage }}" ?></b-form-invalid-feedback>
            </b-form-group>
            <div class="block mt-4">
                <div class="form-check form-switch">
                    <input v-model="post.terms" name="terms" class="form-check-input" type="checkbox" role="switch" v-validate="'required'" id="terms-checkbox">
                    <label class="form-check-label" for="terms-checkbox">Agree Terms & Conditions</label>
                </div>
                <b-form-invalid-feedback :state="termsErrorState"><?= "{{ termsErrorMessage }}" ?></b-form-invalid-feedback>
            </div>

            <alert-message ref="alertmessage" :show="onShowMessage()" class="mt-4 mb-3">
                <p><?= "{{ alertMessageText }}" ?></p>
            </alert-message>

            <div class="flex items-center justify-center mt-4 mb-3">
                <b-button block variant="primary" type="submit" size="lg" class="w-100">Login</b-button>
            </div>                  
            <div v-if="!(post.googleid || post.facebookid)" class="text-center pt-3">
                <p>Login / Register with:</p>
                <b-button :href='urlOpenIDGoogle' variant="outline-primary" type="button" class="btn-floating mx-1">
                    <i class="bi bi-google"></i> Google
                </b-button>
                <b-button :href='urlOpenIDFacebook' variant="outline-primary" type="button" class="btn-floating mx-1">
                    <i class="bi bi-facebook"></i> Facebook
                </b-button>
            </div>
        </b-form>
        <footer class="py-3 my-4">
            <p class="text-center text-muted border-top pt-1">&copy; ID {{ date('Y') }} <?= "{{ appAuthor }}" ?>.</p>
        </footer>
    </b-card-body>
@endsection

@section('postercard')
    <b-card-body :title="posterTitle" class="text-white px-3 py-4 p-md-5 mx-md-4">
        <b-card-text class="small mb-0">
            <?= "{{ posterMessage }}" ?>
        </b-card-text>
    </b-card-body>
@endsection

@section('vuescript')
    @include('components.applogo')
    @include('components.alertmessage')
@endsection

@section('vuecomponent')
    Vue.component('app-logo', { template: '#applogo-template' });
    Vue.component('alert-message', { template: '#alertmessage-template', 
        data: function() {
            return {
                'onDismiss': function() {},
                'dismissCountDown': 0,
                'dismissInterval': 5,
                'enableProgressBar': false,
                'variantDisplay': 'danger',
                'enableButtonDismiss': true,
            };
        },
        methods: {
            'dismissAlert': function() {
                this.dismissCountDown = 0;
                this.onDismiss();
            },
            'dismissCountDownChanged': function(dismissCountDown) {
                this.dismissCountDown = dismissCountDown;
            },    
            'showAlert': function() {
                this.dismissCountDown = this.dismissInterval;
            }
        }
    });
@endsection

@section('vueprop'){
    post: {
        type: Object,
        default: {
            googleid: null,
            facebookid: null,
            npmid: null,
            fullname: null,
            email: null,
            username: null,
            password: null,
            replypassword: null,
            profile_photo_path: null,
            terms: false        
        }
    },
    status: {
        type: Object,
        default: {
            message: null,
            error: {
                npmid: null,
                fullname: null,
                username: null,
                email: null,
                password: null,
                replypassword: null,
                terms: null   
            }     
        }
    },
    hasValidLogin: {
        type: Boolean,
        default: false,
    },
    canLogin: {
        type: Boolean,
        default: false
    }
}@endsection

@section('vueboot'){
    this.init();
}@endsection

@section('vuecomputed'){
    alertMessageText: function() {
        return this.status.message ?? null;
    },
    hasCheckLogin: function() {
        return this.hasValidLogin;
    },
    npmidErrorMessage: function() {
        return this.status.error.npmid ?? this.veeErrors.first('npmid');
    },
    fullnameErrorMessage: function() {
        return this.status.error.fullname ?? this.veeErrors.first('fullname');
    },
    emailErrorMessage: function() {
        return this.status.error.email ?? this.veeErrors.first('email');
    },
    usernameErrorMessage: function() {
        return this.status.error.username ?? this.veeErrors.first('username');
    },
    passwordErrorMessage: function() {
        return this.status.error.password ?? this.veeErrors.first('password');
    },
    replypasswordErrorMessage: function() {
        return this.status.error.replypassword ?? this.veeErrors.first('replypassword');
    },
    termsErrorMessage: function() {
        return this.status.error.terms ?? this.veeErrors.first('terms');
    },   
    npmidErrorState: function() {
        return this.validateState('npmid');
    },
    fullnameErrorState: function() {
        return this.validateState('fullname');
    },
    emailErrorState: function() {
        return this.validateState('email');
    },
    usernameErrorState: function() {
        return this.validateState('username');
    },
    passwordErrorState: function() {
        return this.validateState('password');
    },
    replypasswordErrorState: function() {
        return this.validateState('replypassword');
    },
    termsErrorState: function() {
        return this.validateState('terms');
    },
    showPasswordLabel: function() {
        return (this.showPassword) ? 'hide' : 'show';
    },
    showReplyPasswordLabel: function() {
        return (this.showReplyPassword) ? 'hide' : 'show';
    }
}@endsection

@section('vuemethod'){
    init: function() {
        this.post = {!! $postForm ?? 'this.post' !!};
        this.status = {{ $status ?? 'this.status' }};
        this.canLogin = '{{ isset($canLogin) ? 'true' : 'false' }}';
    },
    onProfileAvatar: function(event) {
        this.post.profile_photo_path = event.target.files[0];
    },
    onShowMessage: function() {
        if (this.hasValidLogin) {
            this.$refs.alertmessage.onDismiss = this.redirectToDashboard;
        }
        return this.hasValidLogin;
    },
    showAlertError: function() {
        this.$refs.alertmessage.variantDisplay = 'danger';
        this.$refs.alertmessage.enableProgressBar = false;
        this.$refs.alertmessage.enableButtonDismiss = false;
        this.$refs.alertmessage.dismissCountDown = this.dismissInterval;
        this.$refs.alertmessage.showAlert();
    },
    showAlertSuccess: function() {
        this.$refs.alertmessage.variantDisplay = 'success';
        this.$refs.alertmessage.enableProgressBar = true;
        this.$refs.alertmessage.enableButtonDismiss = false;
        this.$refs.alertmessage.dismissCountDown = this.dismissInterval;
        this.$refs.alertmessage.showAlert();
    },
    validateState(ref) {
        if (this.veeFields[ref] && (this.veeFields[ref].dirty || this.veeFields[ref].validated)) {
            if (!this.veeErrors.has(ref)) {
                return !this.status.error[ref];
            }
            return !this.veeErrors.has(ref);
        }
        return null;
    },
    resetForm() {
        this.post = {
            npmid: null,
            fullname: null,
            email: null,
            username: null,
            password: null,
            replypassword: null,
            terms: false
        };

        this.$nextTick(() => {
            this.$validator.reset();
        });
    },
    redirectToDashboard() {
        const nextLink = this.route('dashboard');
        setTimeout(function() {
            window.location.href = nextLink;
        }, 1000);
    },
    onRegisterSubmit: function() {
        var $this = this;
        this.$validator.validateAll().then(result => {
            if (!result) {
                return;
            }

            try {
                var input = Object.assign({
                    '_token': this.csrfToken
                }, this.post);
                var dataSend = new FormData();
                Object.entries(input).forEach(entry => {
                    const [key, value] = entry;
                    dataSend.set(key, value);
                });
                dataSend.set('profile_photo_path', this.post.profile_photo_path);
                axios.post(this.route('user.create'), dataSend)
                    .then(function (response) {
                        $this.hasValidLogin=true;
                        $this.status.message = $this.successSignupText;
                        $this.showAlertSuccess();
                        return;
                    })
                    .catch(function (xhr) {
                        if (xhr.response) {
                            const res = xhr.response.data;
                            $this.status.message = res.message;
                            for (let name in res.errors) {
                                if (name in $this.status.error) {
                                    $this.status.error[name] = res.errors[name][0];
                                    $this.showAlertError();                            
                                    setTimeout(() => $this.status.error[name] = null, 3000);
                                }
                            }
                        }
                    });
            } catch (error) {
                // console.log(error);
            }
        });
    },
    togglePassView: function() {
        this.showPassword = !this.showPassword;
    },
    toggleRePassView: function() {
        this.showReplyPassword = !this.showReplyPassword;
    }
}@endsection

@section('vuestyle')
   <style type="text/css">
        .brand-logo > .logo {
            max-width: 160px;
            max-height: 48px;
            margin: 0 auto;
        }
        .btn.btn-outline-input, .btn.btn-outline-input:hover {
            border-color: #dee2e6;
        }
        .postercard-overlay {
            background:#fccb90;
            background:linear-gradient(to right,#ee7724,#d8363a,#dd3675,#b44593);
            background-repeat: no-repeat;
            background-size: cover;;
            text-shadow: -1px 0 #6c757d, 0 1px #6c757d, 1px 0 #6c757d, 0 -1px #6c757d;
        }
        .postercard-overlay .card-title {
            font-weight: bold;
        }
        .postercard-overlay .card-img-overlay {
            height: fit-content;
            margin: auto 0;
        }
        @media (min-width: 768px) {
            .postercard-form {
                background-color:#eee
            }
            .postercard-overlay {
                border-top-right-radius:.3rem;
                border-bottom-right-radius:.3rem
            }
        }
   </style>
@endsection

@section('vuedata'){
    'errorShowInterval': 3,
    'showPassword': false,
    'showReplyPassword': false,
    'successSignupText': 'Register is Successfull',
    'csrfToken': '{{ csrf_token() }}',
    'posterBanner': '{{ asset('/assets/images/absence-preview.jpg') }}',
    'posterTitle': 'Absence Digital Club',
    'posterMessage': 'Welcome and be able to attend with the group, let\'s grow our knowledge and in-depth careers in the field of programming together.'
}@stop
  