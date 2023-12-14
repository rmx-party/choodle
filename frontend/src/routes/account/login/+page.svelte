<script lang="ts">
  import map from 'lodash/fp/map'
  import { startAuthentication } from '@simplewebauthn/browser'
  import type { AuthenticationResponseJSON } from '@simplewebauthn/typescript-types'
  import type { PageData } from './$types'

  export let data: PageData
  const { user, authenticationOptions } = data

  let authenticatorResponse: undefined | AuthenticationResponseJSON
  let verificationJSON: undefined | Record<string, unknown>

  const handleLogin = async () => {
    // TODO: if user has no registered passkeys, prompt them to register instead of proceeding
    try {
      const useBrowserAutofill = false
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
      // TODO: report event to GA
      // TODO: congrats, now what?
      // TODO: update the user store
      // TODO: derive from the user store whether it's anonymous or authenticated
    } else {
      // TODO: report event to GA
      // TODO: bummer, now what? maybe start over?
    }
  }
</script>

<button on:click={handleLogin}>Login</button>

<details>
  <summary>User</summary>
  <pre>
{JSON.stringify(user, null, 2)}
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
