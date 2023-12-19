<script lang="ts">
  import localforage from 'localforage'
  import { getContext } from 'svelte'
  import { goto } from '$app/navigation'
  import { createAnonymousSession, createPasskeySession, endSession } from '$lib/storage'
  import { dashboardPath } from '$lib/routes'
  import { addLoadingReason } from '$lib/store'
  import Button from './Button.svelte'
  import type { Writable } from 'svelte/store'
  import type { User } from '@prisma/client'

  const choodler: Writable<User> = getContext('choodler')

  const isUserRegistered = (user: User) => user.lastAuthenticatedAt !== null

  const handleLogin = async (event: Event) => {
    event.preventDefault()
    const user = await addLoadingReason('createPasskeySession', createPasskeySession())
    console.log('handleLogin', { user })
    if (user?.id) {
      choodler.set(user)
      goto(dashboardPath(), { invalidateAll: true })
    }
  }

  const handleLogout = async (event: Event) => {
    event.preventDefault()

    choodler.set(null)
    localforage.removeItem('deviceId')

    await addLoadingReason('endSession', endSession())

    addLoadingReason(
      'createAnonymousSession',
      createAnonymousSession()
        .then((user) => choodler.set(user))
        .then(() => goto('/', { invalidateAll: true }))
        .catch((error) => {
          console.error(`error creating session`, error)
          choodler.set(null)
        })
    )
  }
</script>

{#if isUserRegistered($choodler)}
  <Button colour="black" on:click={handleLogout}>Logout</Button>
{:else}
  <Button colour="black" on:click={handleLogin}>Login</Button>
{/if}
