<script lang="ts">
    export let data;
</script>

<h1>Daily Prompts</h1>
{#if data.prompts && data.prompts.length}
    <ul>
        {#each data.prompts as prompt}
            <li>
                <pre>{prompt.prompt}</pre>
            </li>
        {/each}
    </ul>
{:else}
    <p>No prompts found.</p>
{/if}
