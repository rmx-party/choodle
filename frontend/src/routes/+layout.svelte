<script lang="ts">
  import { browser } from '$app/environment'
  import { addLoadingReason, isOnline, showLoadingIndicator } from '$lib/store'
  import '$lib/assets/fonts.css'
  import { onMount, setContext } from 'svelte'
  import '../app.css'
  import LoadingIndicator from '../components/LoadingIndicator.svelte'
  import { preloadCode } from '$app/navigation'
  import { urlFor } from '$lib/PersistedImagesUtils'
  import GlobalNavHeader from '../components/GlobalNavHeader.svelte'
  import compact from 'lodash/fp/compact'
  import type { LayoutData } from './$types'
  import { writable, type Writable } from 'svelte/store'
  import { getDeviceId } from '$lib/CreatorUtils'
  import { handleChoodleUncaughtError } from '$lib/errorHandling'
  import ErrorBoundary from '../components/ErrorBoundary.svelte'
  import { choodleCreatorIdKey } from '$lib/Configuration'
  import type { User } from '@prisma/client'
  import { createSession } from '$lib/storage'
  import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit'

  injectSpeedInsights()

  export let data: LayoutData

  const deviceId: Writable<string | null> = writable(null)
  const choodler: Writable<User | undefined> = writable(undefined)
  if (browser) {
    choodler.set(data.user)

    if (data.user && !$deviceId) {
      deviceId.set(data.user.deviceId)
    }
  }
  setContext('deviceId', deviceId)
  setContext('choodler', choodler)

  const rotatingMessages = compact([
    data.copy?.loadingMessage1,
    data.copy?.loadingMessage2,
    data.copy?.loadingMessage3,
    data.copy?.loadingMessage4,
    data.copy?.loadingMessage5,
  ])

  const handleInitialDeviceId = async () => {
    if (!browser) return
    console.log(`getting device id`)
    deviceId.set(await getDeviceId())
  }

  onMount(async () => {
    if (!$deviceId) await addLoadingReason('handleInitialDeviceId', handleInitialDeviceId())
    if (!$choodler) {
      addLoadingReason(
        'createSession',
        createSession({ deviceId: $deviceId })
          .then((user) => choodler.set(user))
          .catch((error) => {
            console.error(`error creating session`, error)
            choodler.set(null)
          })
      )
    }

    preloadCode('/', '/pick/*', '/draw/*', '/share/*', '/guess/*', '/offline')
  })

  const handleStorageEvent = async (event: StorageEvent) => {
    console.log(`storage event`, event)
    if (event.key === choodleCreatorIdKey && event.newValue !== $deviceId) {
      deviceId.set(event.newValue)
    }
  }
  const handleNewDeviceId = async (idValueChange: string | null) => {
    if (!browser) return
    if (!idValueChange) return // TODO: end session?
    if (idValueChange === $deviceId) return

    console.log(`device id changed`, idValueChange, $choodler)

    localStorage.setItem(choodleCreatorIdKey, idValueChange)

    if (!$choodler) {
      console.log(`creating session for user `, idValueChange)

      // TODO: try to detect if there's already a session rather than always recreating it

      const creatingSession = createSession({ deviceId: idValueChange })
      addLoadingReason('awaiting user', creatingSession)
      const user = await creatingSession

      choodler.set(user)

      window?.gtag('config', 'G-T2JJPTNKJS', {
        user_id: $deviceId,
      })
    }
  }
  deviceId.subscribe(handleNewDeviceId)

  $: browser && console.log(`showLoadingIndicator`, $showLoadingIndicator)
</script>

<svelte:window
  on:error={handleChoodleUncaughtError}
  on:storage={handleStorageEvent}
  on:online={() => isOnline.set(true)}
  on:offline={() => isOnline.set(false)}
  on:beforeunload={() => {
    window.gtag('event', 'tab_close')
  }}
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
