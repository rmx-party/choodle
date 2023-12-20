<script lang="ts">
  import localforage from 'localforage'
  import { getContext } from 'svelte'
  import { goto } from '$app/navigation'
  import {
    createAnonymousSession,
    createPasskeySession,
    createPasskeyRegistration,
    endSession,
  } from '$lib/storage'
  import { dashboardPath } from '$lib/routes'
  import { addLoadingReason } from '$lib/store'
  import Button from './Button.svelte'
  import type { Writable } from 'svelte/store'
  import type { User } from '@prisma/client'

  const userStore: Writable<User> = getContext('choodler')

  const isUserRegistered = (user: User) => user?.lastAuthenticatedAt !== null

  const handleRegister = async (event: Event) => {
    event.preventDefault()
    // Show UI appropriate for the `verified` status
    const { verified, user } = await addLoadingReason(
      'createPasskeyRegistration',
      createPasskeyRegistration()
    )
    if (verified && user?.id) {
      // TODO: report event to GA
      // TODO: congrats, now what?
      userStore.set(user)
      goto(dashboardPath(), { invalidateAll: true })
    } else {
      // TODO: report event to GA
      // TODO: bummer, now what? maybe start over?
    }
  }

  const handleLogin = async (event: Event) => {
    event.preventDefault()
    const { verified, user } = await addLoadingReason(
      'createPasskeySession',
      createPasskeySession()
    )
    console.log('handleLogin', { user })
    if (verified && user?.id) {
      userStore.set(user)
      goto(dashboardPath(), { invalidateAll: true })
    }
  }

  const handleLogout = async (event: Event) => {
    event.preventDefault()

    userStore.set(null)
    localforage.removeItem('deviceId')

    await addLoadingReason('endSession', endSession())

    addLoadingReason(
      'createAnonymousSession',
      createAnonymousSession()
        .then((user) => userStore.set(user))
        .then(() => goto(dashboardPath(), { invalidateAll: true }))
        .catch((error) => {
          console.error(`error creating session`, error)
          userStore.set(null)
        })
    )
  }
</script>

<div class="login-controls">
  {#if isUserRegistered($userStore)}
    <Button colour="black" on:click={handleLogout}>Logout</Button>
    <a href="" on:click={handleLogin}>Use Another Account</a>
  {:else}
    <Button colour="black" on:click={handleLogin}>Login</Button>
    <a href="" on:click={handleRegister}>Create an Account</a>
  {/if}
</div>

<style>
  .login-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }
</style>
