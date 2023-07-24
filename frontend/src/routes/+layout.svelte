<svelte:head>
    <meta name="viewport"
          content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, initial-scale=1.0">
</svelte:head>

<main id="main">
    <slot/>
</main>

<script lang="ts">
    import {browser, dev} from "$app/environment"
    import {inject} from "@vercel/analytics"
    import '../app.css'
    import '../fonts.css'

    inject({mode: (dev ? 'development' : 'production')});

    if(browser && 'serviceWorker' in navigator) {
        console.log('registering service worker');
        navigator.serviceWorker.register('/service-worker.js');
    }
</script>

