<script lang="ts">
  import { startRegistration } from '@simplewebauthn/browser'
  import type { RegistrationResponseJSON } from '@simplewebauthn/typescript-types'
  import type { PageData } from './$types'
  import map from 'lodash/fp/map'

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

<button on:click={handleRegister}>Register with a Passkey</button>

<pre>
User
{JSON.stringify(user, null, 2)}

Authenticators
{JSON.stringify(
    map((fido) => ({ ...fido, counter: fido.counter.toString() }), authenticators),
    null,
    2
  )}

Registration Request Options
{JSON.stringify(registrationOptions, null, 2)}

Registration Details
{JSON.stringify(registrationDetails, null, 2)}
</pre>
