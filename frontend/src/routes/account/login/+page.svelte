<script lang="ts">
  import localforage from 'localforage'
  import { getContext } from 'svelte'
  import { goto } from '$app/navigation'
  import { createAnonymousSession, createPasskeySession, endSession } from '$lib/storage'
  import { dashboardPath } from '$lib/routes'
  import type { Writable } from 'svelte/store'
  import type { User } from '@prisma/client'
  import type { PageData } from './$types'
  import { addLoadingReason } from '$lib/store'

  export let data: PageData
  const { user, authenticationOptions } = data

  const choodler: Writable<User> = getContext('choodler')

  const isUserRegistered = (user: User) => {
    return user?.fidoAuthenticators?.length > 0
  }

  const handleLogin = async () => {
    const user = await createPasskeySession()
    console.log('handleLogin', { user })
    if (user?.id) {
      choodler.set(user)
      goto(dashboardPath(), { invalidateAll: true })
    }
  }

  const handleLogout = async () => {
    await endSession()

    choodler.set(null)
    await localforage.removeItem('deviceId')
    addLoadingReason(
      'createAnonymousSession',
      createAnonymousSession()
        .then((user) => choodler.set(user))
        .catch((error) => {
          console.error(`error creating session`, error)
          choodler.set(null)
        })
    )
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
  <pre></pre>
</details>
