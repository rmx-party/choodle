<script lang="ts">
    // tries
    export let content;
    export let guessesRemaining;
    export let guessesLimit;
</script>

{#if content}
    <div class="topBar">
        <div>
            {@html content}
        </div>
        <div>
            <div>Tries</div>
            <div>
                <div>{guessesLimit - guessesRemaining}</div>
                /
                <div>{guessesLimit}</div>
            </div>
        </div>
    </div>
{:else}
    <span style="display:none;">no prompt</span>
{/if}


<style>
    .topBar {
        display: flex;
        width: 100%;
        padding: 1rem 1rem 0.75rem 1rem;
        align-items: center;
        gap: 0.625rem;

        border-radius: 0rem 0rem 0.75rem 0.75rem;
        background: var(--choodle-yellow, #FEF40A);
        box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.20);
        backdrop-filter: blur(71.56488800048828px);
    }
</style>
