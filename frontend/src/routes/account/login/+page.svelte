<script lang="ts">
  import type { PageData } from './$types'
  import AuthenticationButtons from '../../../components/AuthenticationButtons.svelte'
  import { featureAuthentication } from '$lib/Configuration'

  export let data: PageData
  const { user, authenticationOptions } = data
</script>

{#if featureAuthentication}
  <AuthenticationButtons />
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
