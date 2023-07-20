<script lang="ts">
    export let prompt;
    import wordmark from '$lib/assets/choodle-wordmark.png';
</script>


{#if prompt}
    <div class="anchor">
        <div class="board-overlay">
            <p class="daily-prompt">
                <img src={wordmark} alt="Choodle" height="16" width="55" /><br/>
                <span>{prompt.prompt}</span>
            </p>
        </div>
    </div>
{:else}
    <span style="display:none;">no prompt</span>
{/if}


<style>
    .anchor {
        position: relative;
        margin: 0;
        padding: 0;
        width: 100%;
        height: 0;
    }
    .board-overlay {
        opacity: 90%;
        z-index: 999;
        position: absolute;
        display: block;
        margin: 0 auto;
        padding: 0;
        top: 1em;
        left: 1em;
        right: 1em;
    }
    .daily-prompt {
        border-radius: 1.5rem;
        background: var(--color-primary);
        box-shadow: 0px 4px 24px 0px rgba(0, 0, 0, 0.01), 0px -2px 8px 0px rgba(0, 0, 0, 0.12) inset, 0px 2px 24px 0px rgba(255, 255, 255, 0.40) inset, 0px 1px 4px 0px rgba(0, 0, 0, 0.04);
        font-weight: 700;
        padding: 0.5em;
        margin: 0;
        pointer-events: none;
        text-align: center;
        vertical-align: bottom;
        line-height: 1.5em;
    }
    img {
        display: inline-block;
        vertical-align: text-top;
    }
</style>
