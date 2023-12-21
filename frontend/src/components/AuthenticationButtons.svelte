<script lang="ts">
  import localforage from 'localforage'
  import { browserSupportsWebAuthn } from '@simplewebauthn/browser'
  import { getContext } from 'svelte'
  import { goto } from '$app/navigation'
  import { browser } from '$app/environment'
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

  const passkeyCompatible = browser && browserSupportsWebAuthn()

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

{#if passkeyCompatible}
  <div class="login-controls">
    {#if isUserRegistered($userStore)}
      <Button colour="black" on:click={handleLogout}>Logout</Button>
      <a href="" on:click={handleLogin}>Use Another Account</a>
    {:else}
      <Button colour="black" on:click={handleLogin}>Login</Button>
      <a href="" on:click={handleRegister}>Create an Account</a>
    {/if}
  </div>
{:else}
  <div class="not-supported">
    <p>
      This browser does not support Passkey login yet. To use a Passkey account, please try a
      <a target="_blank" href="https://passkeys.dev/device-support/#matrix"
        >browser that supports Passkeys</a
      >, and enable Passkeys in your system settings.
    </p>
    <p>
      <a target="_blank" href="https://www.corbado.com/blog/passkey-troubleshooting-solutions"
        >Here's a troubleshooting guide</a
      >
    </p>
  </div>
{/if}

<style>
  .login-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .not-supported {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    border: 1px solid var(--choodle-black, #000);
    border-radius: 0.5rem;
    padding: 1rem;
    text-wrap: balance;
  }
</style>
