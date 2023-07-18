<script lang="ts">
    export let data = [];
</script>

{#if data.prompts && data.prompts.length}
    <ul>
        {#each data.prompts as prompt}
            <li>
                <pre>{JSON.stringify(prompt)}</pre>
            </li>
        {/each}
    </ul>
{:else}
    <p>No prompts found.</p>
{/if}
