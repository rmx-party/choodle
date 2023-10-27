<script lang="ts">
    import {browser, dev} from "$app/environment"
    import {isOnline} from "$lib/store"
    import {webVitals, analyticsId} from "$lib/vitals"
    import '$lib/assets/fonts.css'
    import { onMount } from "svelte";
    import '../app.css'
    import LoadingIndicator from "../components/LoadingIndicator.svelte";
    import Bugsnag from "@bugsnag/js";
    import { page } from "$app/stores";

    console.log('analytics ID', analyticsId)
    $: if (browser && analyticsId) {
      webVitals({
        path: $page.url.pathname,
        params: $page.params,
        analyticsId
      })
    }


    if (browser && !dev) {
      Bugsnag.start({apiKey: '91931cee1cbae5feec1925a566386158'})
    }

    onMount(async () => {
      if (!browser) return;

      window.addEventListener('online', () => {
        console.log('online')
        isOnline.set(true)
      })
      window.addEventListener('offline', () => {
        console.log('offline')
        isOnline.set(false)
      })
    })
</script>

<LoadingIndicator />
<slot/>
