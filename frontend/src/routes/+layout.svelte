<script lang="ts">
    import {browser} from "$app/environment"
    import {isOnline} from "$lib/store"
    import '$lib/assets/fonts.css'
    import { onMount } from "svelte";
    import '../app.css'
    import LoadingIndicator from "../components/LoadingIndicator.svelte";

    import { appsignal } from "$lib/appsignal";

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
