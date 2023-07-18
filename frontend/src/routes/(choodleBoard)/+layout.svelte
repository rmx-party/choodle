<svelte:head>
    <title>Choodle Prototype</title>
    <meta name="viewport"
          content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, initial-scale=1.0, user-scalable=no">
</svelte:head>

<main id="main">
    <noscript>
        <p>
            This app requires JavaScript to run. Please enable JavaScript and reload the page.
        </p>
    </noscript>
    <slot/>
</main>

<script lang="ts">
    import {dev} from "$app/environment"
    import {inject} from "@vercel/analytics"
    import '../../app.css'

    inject({mode: (dev ? 'development' : 'production')});
</script>
