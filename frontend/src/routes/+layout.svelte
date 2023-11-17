<script lang="ts">
  import { browser } from '$app/environment'
  import { isOnline, loading } from '$lib/store'
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
  import { writable, type Writable } from 'svelte/store'
  import { getDeviceId, locateCreator } from '$lib/CreatorUtils'
  import { handleChoodleUncaughtError } from '$lib/errorHandling'
  import ErrorBoundary from '../components/ErrorBoundary.svelte'
  import type { StreakGuessingGamePlayer } from '$lib/CWFGame'
  import { choodleCreatorIdKey } from '$lib/Configuration'

  export let data: LayoutData

  const deviceId: Writable<string | undefined> = writable()
  const choodler: Writable<StreakGuessingGamePlayer | undefined> = writable()
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

  const handleInitialDeviceId = async () => {
    deviceId.set(await getDeviceId())
  }
  $: browser && !$deviceId && handleInitialDeviceId()

  onMount(async () => {
    preloadCode('/', '/pick/*', '/draw/*', '/share/*', '/guess/*', '/offline')
  })

  const handleStorageEvent = async (event: StorageEvent) => {
    console.log(`storage event`, event)
    if (event.key === choodleCreatorIdKey) {
      const newDeviceId = await getDeviceId()
      deviceId.set(newDeviceId)
    }
  }
  const handleNewDeviceId = async (idValueChange: string | undefined) => {
    console.log(`new device ID`, idValueChange)
    if (!idValueChange) return
    if (idValueChange !== $deviceId || $choodler === undefined) {
      $loading || loading.set(true)
      console.log(`getting creator from device ID`, idValueChange)
      const creator = await locateCreator({ deviceId: idValueChange })
      console.log(`found creator`, creator)
      choodler.set(creator)
      localStorage.setItem(choodleCreatorIdKey, idValueChange)
      loading.set(false) // This is only sometimes correct, a push/delete queue or map of pending operations model will be better
    }
  }
  deviceId.subscribe(handleNewDeviceId)

  $: console.log(`layout context`, { choodler: $choodler, deviceId: $deviceId })
</script>

<svelte:window
  on:error={handleChoodleUncaughtError}
  on:storage={handleStorageEvent}
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
