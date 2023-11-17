<script lang="ts">
  import { browser } from '$app/environment'
  import { isOnline } from '$lib/store'
  import { webVitals } from '$lib/vitals'
  import '$lib/assets/fonts.css'
  import { onMount, setContext } from 'svelte'
  import '../app.css'
  import LoadingIndicator from '../components/LoadingIndicator.svelte'
  import { page } from '$app/stores'
  import { preloadCode } from '$app/navigation'
  import { urlFor } from '$lib/PersistedImagesUtils'
  import GlobalNavHeader from '../components/GlobalNavHeader.svelte'
  import compact from 'lodash/fp/compact'
  import type { LayoutData } from './$types'
  import { writable } from 'svelte/store'
  import { getDeviceId, locateCreator } from '$lib/CreatorUtils'
  import { handleChoodleUncaughtError } from '$lib/errorHandling'
  import ErrorBoundary from '../components/ErrorBoundary.svelte'

  export let data: LayoutData

  const deviceId = writable()
  const choodler = writable()
  setContext('deviceId', deviceId)
  setContext('choodler', choodler)

  console.log('analytics ID', data.analyticsId)
  $: {
    if (browser && data.analyticsId) {
      webVitals({
        path: $page.url.pathname,
        params: $page.params,
        analyticsId: data.analyticsId,
      })
    }
  }

  const rotatingMessages = compact([
    data.copy?.loadingMessage1,
    data.copy?.loadingMessage2,
    data.copy?.loadingMessage3,
    data.copy?.loadingMessage4,
    data.copy?.loadingMessage5,
  ])

  onMount(async () => {
    deviceId.set(await getDeviceId())
    choodler.set(await locateCreator($deviceId))
    console.log(`layout context`, { choodler: $choodler, deviceId: $deviceId })
    preloadCode('/', '/pick/*', '/draw/*', '/share/*', '/guess/*', '/offline')
  })
</script>

<svelte:window
  on:error={handleChoodleUncaughtError}
  on:online={() => isOnline.set(true)}
  on:offline={() => isOnline.set(false)}
/>
<svelte:document on:error={handleChoodleUncaughtError} />

<ErrorBoundary>
  <LoadingIndicator {rotatingMessages} />
  <GlobalNavHeader
    logoUrl={urlFor(data.copy.logo).url()}
    logoLinkDestination={data.copy.logoLinkDestination}
  />
  <slot />
</ErrorBoundary>
