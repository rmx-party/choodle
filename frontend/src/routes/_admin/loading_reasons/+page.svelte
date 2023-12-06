<script lang="ts">
  import {
    loading,
    addLoadingReason,
    clearLoadingReasons,
    loadingReasons,
    showLoadingIndicator,
  } from '$lib/store'

  const addSmallReason = async () => {
    let timeOutId
    const promise = new Promise((resolve) => {
      timeOutId = setTimeout(() => {
        resolve('small')
      }, 3000)
    })

    addLoadingReason(`small-${timeOutId}`, promise)
  }

  const addBigReason = async () => {
    let timeOutId
    const promise = new Promise((resolve) => {
      timeOutId = setTimeout(() => {
        resolve('big')
      }, 10000)
    })

    addLoadingReason(`big-${timeOutId}`, promise)
  }
</script>

<menu>
  <button on:click={clearLoadingReasons}>clear</button>
  <button on:click={addSmallReason}>small</button>
  <button on:click={addBigReason}>big</button>
  <button on:click={() => loading.set(true)}>true</button>
  <button on:click={() => loading.set(false)}>false</button>
</menu>

<h2>loading reasons</h2>
<ul>
  {#each $loadingReasons as reason}
    <li>{JSON.stringify(reason)}</li>
  {/each}
</ul>

{#if $showLoadingIndicator}
  <h2>show loading indicator</h2>
{/if}
