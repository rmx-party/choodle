<svelte:head>
    <title>Choodle Prototype</title>
    <meta name="viewport"
          content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, initial-scale=1.0">
</svelte:head>

<nav>
    <a href="/">draw</a>
    <a href="/gallery">gallery</a>
    <a href="/prompts">prompts</a>
</nav>
<main id="main">
    <slot/>
</main>

<script lang="ts">
    import {dev} from "$app/environment"
    import {inject} from "@vercel/analytics"
    import '../app.css'

    inject({mode: (dev ? 'development' : 'production')});
</script>

