<script lang="ts">
  import { startRegistration } from '@simplewebauthn/browser'
  import localforage from 'localforage'
  import { getContext } from 'svelte'
  import { goto } from '$app/navigation'
  import { createAnonymousSession, createPasskeySession, endSession } from '$lib/storage'
  import { dashboardPath } from '$lib/routes'
  import { addLoadingReason } from '$lib/store'
  import Button from './Button.svelte'
  import type { Writable } from 'svelte/store'
  import type { User } from '@prisma/client'
  import type {
    PublicKeyCredentialCreationOptionsJSON,
    RegistrationResponseJSON,
  } from '@simplewebauthn/typescript-types'

  let userStore: Writable<User> = getContext('choodler')

  const isUserRegistered = (user: User) => user?.lastAuthenticatedAt !== null

  const handleRegister = async (event: Event) => {
    event.preventDefault()
    let registrationDetails: RegistrationResponseJSON | undefined = undefined

    const registrationOptions: PublicKeyCredentialCreationOptionsJSON = (
      await fetch('/account/registration')
    ).json()

    try {
      registrationDetails = await startRegistration(registrationOptions)
      console.log({ registrationDetails })
      // TODO: report event to GA
    } catch (err) {
      console.warn(`error registering`, err)
      // TODO: fail gracefully
      // TODO: try to select user cancellation vs timeout vs other errors
      // TODO: report event to GA
    }

    if (!registrationDetails) return

    const verificationResp = await fetch('/account/registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationDetails),
    })

    // Wait for the results of verification
    const verificationJSON = await verificationResp.json()
    console.log({ verificationJSON })

    // Show UI appropriate for the `verified` status
    if (verificationJSON?.verified) {
      // TODO: report event to GA
      // TODO: congrats, now what?
      const user = verificationJSON.user
      if (user?.id) {
        userStore.set(user)
        goto(dashboardPath(), { invalidateAll: true })
      }
    } else {
      // TODO: report event to GA
      // TODO: bummer, now what? maybe start over?
    }
  }

  const handleLogin = async (event: Event) => {
    event.preventDefault()
    const user = await addLoadingReason('createPasskeySession', createPasskeySession())
    console.log('handleLogin', { user })
    if (user?.id) {
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
        .then(() => goto('/', { invalidateAll: true }))
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
