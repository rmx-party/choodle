<script lang="ts">
    import {browser, dev} from "$app/environment"
    import '$lib/assets/fonts.css'
    import '../app.css'
    import LoadingIndicator from "../components/LoadingIndicator.svelte";

    import Bugsnag from "@bugsnag/js";

    if (browser && !dev) {
      Bugsnag.start({apiKey: '91931cee1cbae5feec1925a566386158'})
    }
</script>

<LoadingIndicator />
<slot/>
