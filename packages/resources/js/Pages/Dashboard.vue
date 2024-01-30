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
  props: {
    canLogin: Boolean,
    canRegister: Boolean,
    laravelVersion: String,
    phpVersion: String,
  }
}
</script>
<template>
    <Head title="Welcome to Club Coding Palcomtech" />
    <main>
      <div class="px-4 pt-5 mt-5 mb-3 text-center border-bottom">
        <div class="d-block mx-auto mb-4 brand-logo">
          <ApplicationLogo />
        </div>
      </div>
    </main>
</template>