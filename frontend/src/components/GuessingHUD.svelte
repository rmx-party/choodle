<script lang="ts">
  import TopBar from "./TopBar.svelte";

  export let guessesRemaining: number | undefined = undefined;
  export let guessesLimit: number | undefined = undefined;
</script>

<TopBar>
  <div slot="topBarContent" class="guessingHUDInner">
    <slot name="content"/>

    {#if guessesRemaining !== undefined && guessesLimit !== undefined}
      <div class="guessCounter">
        <span>
          <span>{guessesRemaining}</span>/<span>{guessesLimit}</span>
        </span>
      </div>
    {/if}
  </div>
</TopBar>

<style>
  .guessingHUDInner {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.625rem;
    flex-direction: row;
    justify-content: space-between;
  }
</style>
