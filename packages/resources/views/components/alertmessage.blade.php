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
<script type="text/x-template" id="alertmessage-template">
    <b-alert :show="dismissCountDown" :variant="variantDisplay" :dismissible="enableButtonDismiss"  @dismissed="dismissAlert" @dismiss-count-down="dismissCountDownChanged">
        <p><slot></slot></p>
        <b-progress v-if="enableProgressBar" variant="warning" :max="dismissInterval" :value="dismissCountDown" height="4px"></b-progress>
    </b-alert>
</script>