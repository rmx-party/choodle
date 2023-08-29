
<slot/>

<script lang="ts">
    import {browser, dev} from "$app/environment"
    import '../app.css'
    import '$lib/assets/fonts.css'

    import Bugsnag from "@bugsnag/js";

    Bugsnag.start({apiKey: '91931cee1cbae5feec1925a566386158'})
</script>

