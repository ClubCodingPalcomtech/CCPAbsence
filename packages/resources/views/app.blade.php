<!--//
 - SDaiLover Open Source & Software Development
 -
 - @fullname  : Stephanus Bagus Saputra,
 -              ( 戴 Dai 偉 Wie 峯 Funk )
 - @email     : wiefunk@stephanusdai.web.id
 - @contact   : https://t.me/wiefunkdai
 - @support   : https://opencollective.com/wiefunkdai
 - @link      : https://www.sdailover.web.id,
 -              https://www.stephanusdai.web.id
 - @license   : https://www.sdailover.web.id/license/
 - @copyright : (c) 2023 StephanusDai Developer. All rights reserved.
 - This software using Laravel Framework has released under the terms of the MIT License.
 //-->
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title inertia>{{ config('app.name', 'Club Coding Palcomtech') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet" />

    <!-- Scripts -->
    @routes
    @vite(['resources/css/app.css', 'resources/js/app.js', "resources/js/Pages/{$page['component']}.vue"])
    @inertiaHead
</head>
<body class="font-sans antialiased">
    @inertia
</body>
</html>