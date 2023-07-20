<svelte:head>
    <title>Choodle Prototype</title>
    <meta name="viewport"
          content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, initial-scale=1.0">

    <!-- TODO: set canonical URL (decide trailing slash etc) -->
    <meta property="og:type" content='website'/>
    <meta property="og:url" content={$page.url}/>
    <meta property="og:site_name" content="Choodle"/>
    <meta property="og:title" content="Choodle"/>
    <meta property="og:image" content={opengraphChoodle}/>
    <meta property="og:image:secure_url" content={opengraphChoodle}/>
    <meta property="og:image:width" content="630"/>
    <meta property="og:image:height" content="630"/>
    <meta property="og:image:alt" content="Choodle"/>
    <meta property="og:description"
          content="Draw something that lasts forever. Express yourself with lo-fi doodles that are yours to keep, sell, or share."/>
    <meta name="description"
          content="Draw something that lasts forever. Express yourself with lo-fi doodles that are yours to keep, sell, or share."/>
</svelte:head>

<!-- <nav> -->
<!--     <a href="/">draw</a> -->
<!--     <a href="/gallery">gallery</a> -->
<!--     <a href="/prompts">prompts</a> -->
<!-- </nav> -->
<main id="main">
    <slot/>
</main>

<script lang="ts">
    import {dev} from "$app/environment"
    import {inject} from "@vercel/analytics"
    import '../app.css'
    import {page} from "$app/stores";
    import {urlFor} from "$lib/PersistedImagesUtils";
    import opengraphChoodle from '$lib/assets/OpenGraph-Choodle-630x630-2x.png';

    inject({mode: (dev ? 'development' : 'production')});
</script>

