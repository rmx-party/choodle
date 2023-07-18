<script lang="ts">
    export let prompts;
</script>

{#if prompts && prompts.length}
<ul>
  {#each prompts as prompt}
            <li><pre>{JSON.stringify(prompt)}</pre></li>
  {/each}
</ul>
{:else}
	<p>No prompts found.</p>
{/if}
