<script lang="ts">
  import { loading, uncaughtErrors } from '$lib/store'
  import { onMount } from 'svelte'

  const goHome = () => {
    uncaughtErrors.set([])
    window.location.href = '/'
  }

  onMount(() => {
    loading.set(false)
  })
</script>

{#if $uncaughtErrors.length > 0}
  <h1>Something broke</h1>

  <p>
    <a href="/" on:click={goHome}>maybe go back home</a> or
    <a href="javascript:location.reload()">try reloading the page</a>
  </p>
  <p>some technical context is below in case you're the one fixing it</p>

  {#each $uncaughtErrors as oneError}
    <br />
    {@const { error, event } = oneError}
    <details>
      <summary>{error.message}</summary>
      <pre>
      error msg: {error.message}
      stack:
      {error.stack}

      event: {event.toString()}
    </pre>
    </details>
  {/each}
{:else}
  <slot />
{/if}
