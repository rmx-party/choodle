<svelte:head>
    <meta name="viewport"
          content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, initial-scale=1.0">
    <script src="//d2wy8f7a9ursnm.cloudfront.net/v7/bugsnag.min.js"></script>
    <script>
        import Bugsnag from "@bugsnag/js";

        Bugsnag.start({apiKey: '91931cee1cbae5feec1925a566386158'})
    </script>
</svelte:head>

<slot/>

<script lang="ts">
    import {browser, dev} from "$app/environment"
    import {inject} from "@vercel/analytics"
    import '../app.css'
    import '$lib/assets/fonts.css'

    inject({mode: (dev ? 'development' : 'production')});
</script>

