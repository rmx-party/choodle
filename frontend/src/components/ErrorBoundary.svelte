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
  <main>
    <h1>🐛 Congrats 🪲<br />🐜 bug hunter 🐝</h1>
    <p>you caught {$uncaughtErrors.length} bugs this time. we appreciate your hard work.</p>

    <p>
      what now? you could
      <a href="/" on:click={goHome}>maybe go back home</a> or
      <a href="javascript:location.reload()">try reloading the page</a>
    </p>
    <section>
      <p>some details are here in case you're the one responsible for eliminating bugs</p>

      {#each $uncaughtErrors as oneError}
        <br />
        {@const { error, event } = oneError}
        <details>
          <summary>{error?.message}</summary>
          <pre>
      error msg: {error?.message}
      stack:
      {error?.stack}

      event: {event?.toString()}
    </pre>
        </details>
      {/each}
    </section>
  </main>
{:else}
  <slot />
{/if}

<style>
  main {
    width: 100lvw;
    height: 100svh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
  }
</style>
