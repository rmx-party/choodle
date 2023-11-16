<script lang="ts">
  import type { StreakGuessingGamePlayer } from '$lib/CWFGame'
  import { getContext } from 'svelte'
  import type { Writable } from 'svelte/store'

  const currentChoodler: Writable<StreakGuessingGamePlayer> = getContext('choodler')
</script>

<h3 class="hud">
  <strong>
    {#if $currentChoodler?.username?.length}
      👋 Hi <span class="username">{$currentChoodler?.username || 'unnamed user'}</span>!
    {:else}
      👋 Hi!
    {/if}
    <br />
    Welcome Home!
  </strong>
</h3>

<style>
  .hud {
    width: 100%;
    margin-top: 2rem;
  }

  .username {
    display: inline-block;
    color: var(--text-text-primary, #141518);
    background: var(--choodle-yellow, #fef40a);
  }
</style>
