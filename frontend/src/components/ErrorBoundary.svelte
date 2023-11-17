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
    {@const { error, message, filename, lineno, colno, target } = oneError}
    <details>
      <summary>{message}</summary>
      <pre>
      message: {message}
      error msg: {error.message}
      stack:
      {error.stack}

      source: {filename}
      line: {lineno}
      col: {colno}
      {target.toString()}
    </pre>
    </details>
  {/each}
{:else}
  <slot />
{/if}
