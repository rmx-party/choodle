<script lang="ts">
  import { startAuthentication } from '@simplewebauthn/browser'
  import type { AuthenticationResponseJSON } from '@simplewebauthn/typescript-types'
  import type { PageData } from './$types'
  import { goto, invalidate } from '$app/navigation'
  import localforage from 'localforage'
  import type { User } from '@prisma/client'

  export let data: PageData
  const { user, authenticationOptions } = data

  let authenticatorResponse: undefined | AuthenticationResponseJSON
  let verificationJSON: undefined | Record<string, unknown>

  const isUserRegistered = (user: User) => {
    return user?.fidoAuthenticators?.length > 0
  }

  const handleLogin = async () => {
    // TODO: if user has no registered passkeys, prompt them to register instead of proceeding
    let useBrowserAutofill = false
    console.log({ authenticationOptions })
    try {
      if (!data.authenticationOptions?.challenge?.length) {
        await invalidate('/account/login')
      }
      if (data.authenticationOptions?.allowCredentials?.length) {
        useBrowserAutofill = true
      }
      authenticatorResponse = await startAuthentication(authenticationOptions, useBrowserAutofill)
      // TODO: report event to GA
    } catch (err) {
      console.warn(`error registering`, err)
      // TODO: fail gracefully
      // TODO: try to select user cancellation vs timeout vs other errors
      // TODO: report event to GA
    }
    console.log({ authenticatorResponse })

    if (!authenticatorResponse) return

    const verificationResp = await fetch('/account/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(authenticatorResponse),
    })

    // Wait for the results of verification
    verificationJSON = await verificationResp.json()
    console.log({ verificationJSON })

    // Show UI appropriate for the `verified` status
    if (verificationJSON && verificationJSON.verified) {
      invalidate('/account/login')
      // TODO: report event to GA
      // TODO: congrats, now what?
      // TODO: update the user store
      // TODO: derive from the user store whether it's anonymous or authenticated
    } else {
      invalidate('/account/login')
      // TODO: report event to GA
      // TODO: bummer, now what? maybe start over?
    }
  }

  const handleLogout = async () => {
    const response = await fetch('/session', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const { success } = await response.json()

    if (!success) throw new Error(`error logging out`)

    localforage.removeItem('deviceId')
    goto('/', { invalidateAll: true })
  }
</script>

{#if isUserRegistered(user)}
  <p>signed in as user {user.id} with passkey</p>
  <button on:click={handleLogout}>Logout</button>
{:else}
  <p>anonymous session</p>
  <label for="username">Username:</label>
  <input name="username" id="loginform.username" autocomplete="webauthn" />
  <button on:click={handleLogin}>Login</button>
{/if}

<details>
  <summary>User</summary>
  <pre>
{JSON.stringify(user.id, null, 2)}
</pre>
</details>

<details>
  <summary>Authentication Request Options</summary>
  <pre>
{JSON.stringify(authenticationOptions, null, 2)}
</pre>
</details>

<details>
  <summary>Login Details</summary>
  <pre>
{JSON.stringify(verificationJSON, null, 2)}
</pre>
</details>
