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

import { Head } from '@inertiajs/vue2'

export default {
  props: {
    title: {
        type: String,
        default: 'Welcome to Club Coding',
    }
  }
}
</script>
<template>
  <Head :title="title ? `${title} - CCP Absence` : 'CCP Absence'">
    <slot />
  </Head>
</template>