<script>
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

import { Head } from '@inertiajs/vue2';
import ApplicationLogo from '@/Components/ApplicationLogo.vue';

export default {
  components: {
    Head,
    ApplicationLogo
  },
  data: function() {
    const nowDate =new Date();
    const currentYear = nowDate.getFullYear();
    return Object.assign($data, {
      'copyrightYear': currentYear,
      'welcomeMessage': 'Welcome and be able to attend with the group, let\'s grow our knowledge and in-depth careers in the field of programming together.'
    });
  },
  props: {
    authUser: Object,
    canLogin: Boolean,
    canRegister: Boolean,
    laravelVersion: String,
    phpVersion: String,
  }
}
</script>
<template>
  <div>
    <main>
      <Head title="Welcome to Club Coding Palcomtech" />
      <div class="px-4 pt-5 mt-5 mb-3 text-center border-bottom">
        <div class="d-block mx-auto mb-4 brand-logo">
          <ApplicationLogo />
        </div>
        <div class="col-lg-6 mx-auto">
          <h2 class="display-4 fw-bold text-body-emphasis">Club AbSence</h2>
          <p class="lead mb-4">{{ welcomeMessage }}</p>
          <div v-if="canLogin" class="d-grid gap-2 d-sm-flex justify-content-sm-center mb-5">
            <b-button v-if="authUser" :href="route('dashboard')" variant="primary" size="lg" class="px-4 me-sm-3">Log in</b-button>
            <template v-else>
              <b-button :href="route('login')" variant="primary" size="lg" class="px-4 me-sm-3">Login</b-button>
              <b-button v-if="canRegister" :href="route('register')" variant="outline-secondary" size="lg" class="px-4">Register</b-button>
            </template>
          </div>
          <div class="overflow-hidden" style="max-height: 30vh;">
            <div class="container px-5">
              <img src="@/../images/absence-preview.jpg" class="img-fluid mx-auto border rounded-3 shadow-lg mb-4" alt="Smart Campus Palcomtech" width="700" height="500" loading="lazy">
            </div>
          </div>
        </div>
      </div>
      <footer class="px-4 pt-0 mt-0 mb-5 text-center text-muted"> &copy; ID {{ copyrightYear }} Club Coding Palcomtech.</footer>
    </main>
  </div>
</template>

<style>
  .brand-logo > * {
    max-width: 200px;
    max-height: 80px;
    margin: 0 auto;
  }
</style>