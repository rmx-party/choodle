<script lang="ts">
  import { browser, dev } from '$app/environment'
  import { isOnline } from '$lib/store'
  import { webVitals } from '$lib/vitals'
  import '$lib/assets/fonts.css'
  import { onMount } from 'svelte'
  import '../app.css'
  import LoadingIndicator from '../components/LoadingIndicator.svelte'
  import { page } from '$app/stores'
  import { filter } from 'lodash/fp'
  import { preloadCode } from '$app/navigation'
  import { urlFor } from '$lib/PersistedImagesUtils'
  import GlobalNavHeader from '../components/GlobalNavHeader.svelte'

  export let data

  console.log('analytics ID', data.analyticsId)
  $: if (browser && data.analyticsId) {
    webVitals({
      path: $page.url.pathname,
      params: $page.params,
      analyticsId: data.analyticsId,
    })
  }

  const rotatingMessages = filter(
    (msg) => msg,
    [
      data.copy?.loadingMessage1,
      data.copy?.loadingMessage2,
      data.copy?.loadingMessage3,
      data.copy?.loadingMessage4,
      data.copy?.loadingMessage5,
    ]
  )

  onMount(async () => {
    preloadCode('/', '/draw', '/share/*', '/guess/*')
  })
</script>

<svelte:window on:online={() => isOnline.set(true)} on:offline={() => isOnline.set(false)} />
<LoadingIndicator {rotatingMessages} />
<GlobalNavHeader
  logoUrl={urlFor($page.data.copy.logo)}
  logoLinkDestination={$page.data.copy.logoLinkDestination}
/>
<slot />
