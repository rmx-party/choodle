<script lang="ts">
  import map from 'lodash/fp/map'
  import { startRegistration } from '@simplewebauthn/browser'
  import type { RegistrationResponseJSON } from '@simplewebauthn/typescript-types'
  import type { PageData } from './$types'

  export let data: PageData
  const { user, authenticators, registrationOptions } = data
  let registrationDetails: undefined | RegistrationResponseJSON

  const handleRegister = async () => {
    try {
      registrationDetails = await startRegistration(registrationOptions)
      // TODO: report event to GA
    } catch (err) {
      console.warn(`error registering`, err)
      // TODO: fail gracefully
      // TODO: try to select user cancellation vs timeout vs other errors
      // TODO: report event to GA
    }
    console.log({ registrationDetails })

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
    if (verificationJSON && verificationJSON.verified) {
      // TODO: report event to GA
      // TODO: congrats, now what?
    } else {
      // TODO: report event to GA
      // TODO: bummer, now what? maybe start over?
    }
  }
</script>

<button on:click={handleRegister}>Register a Passkey</button>

<details>
  <summary>User</summary>
  <pre>
{JSON.stringify({ id: user.id, category: user.defaultCategorySlug }, null, 2)}
</pre>
</details>

<details>
  <summary>Authenticators</summary>
  <pre>
{JSON.stringify(
      map((fido) => ({ ...fido, counter: fido.counter.toString() }), authenticators),
      null,
      2
    )}
</pre>
</details>

<details>
  <summary>Registration Request Options</summary>
  <pre>
{JSON.stringify(registrationOptions, null, 2)}
</pre>
</details>

<details>
  <summary>Registration Details</summary>
  <pre>
{JSON.stringify(registrationDetails, null, 2)}
</pre>
</details>
