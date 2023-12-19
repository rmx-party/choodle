<script lang="ts">
  import compact from 'lodash/fp/compact'
  import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit'
  import { browser } from '$app/environment'
  import { onMount, setContext } from 'svelte'
  import { preloadCode } from '$app/navigation'
  import { writable, type Writable } from 'svelte/store'
  import { addLoadingReason, isOnline, showLoadingIndicator } from '$lib/store'
  import { handleChoodleUncaughtError } from '$lib/errorHandling'
  import { createAnonymousSession } from '$lib/storage'
  import { urlFor } from '$lib/PersistedImagesUtils'
  import '$lib/assets/fonts.css'
  import '../app.css'
  import LoadingIndicator from '../components/LoadingIndicator.svelte'
  import GlobalNavHeader from '../components/GlobalNavHeader.svelte'
  import ErrorBoundary from '../components/ErrorBoundary.svelte'
  import type { User } from '@prisma/client'
  import type { LayoutData } from './$types'

  injectSpeedInsights()

  export let data: LayoutData

  const choodler: Writable<User | undefined> = writable(undefined)
  if (browser && data.user) {
    choodler.set(data.user)
  }
  setContext('choodler', choodler)

  const rotatingMessages = compact([
    data.copy?.loadingMessage1,
    data.copy?.loadingMessage2,
    data.copy?.loadingMessage3,
    data.copy?.loadingMessage4,
    data.copy?.loadingMessage5,
  ])

  onMount(async () => {
    if (!$choodler) {
      addLoadingReason(
        'createAnonymousSession',
        createAnonymousSession()
          .then((user) => choodler.set(user))
          .catch((error) => {
            console.error(`error creating session`, error)
            choodler.set(null)
          })
      )
    }

    preloadCode('/', '/pick/*', '/draw/*', '/share/*', '/guess/*', '/offline')
  })

  const handleLocalStorageEvent = (event: Event) => {
    console.log(`local storage event`, event)
  }

  $: browser && console.log(`showLoadingIndicator`, $showLoadingIndicator)
</script>

<svelte:window
  on:error={handleChoodleUncaughtError}
  on:storage={handleLocalStorageEvent}
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
