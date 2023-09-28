<script lang="ts">
    import {toHTML} from "@portabletext/to-html";

    export let content = '';
    export let guessesRemaining: number;
    export let guessesLimit: number;
</script>

{#if content}
    <div class="topBar">
        <div class="content">{@html toHTML(content)}</div>

        <div class="guessCounter">
            <span>Tries</span>
            <br/>
            <span>
                <span>{guessesLimit - guessesRemaining}</span>/<span>{guessesLimit}</span>
            </span>
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
        flex-direction: row;
        justify-content: space-between;

        border-radius: 0rem 0rem 0.75rem 0.75rem;
        background: var(--choodle-yellow, #FEF40A);
        box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.20);
        backdrop-filter: blur(71.56488800048828px);
    }
</style>
