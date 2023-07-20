<script lang="ts">
    export let prompt;
    import wordmark from '$lib/assets/choodle-wordmark.png';
</script>


{#if prompt}
    <div class="anchor">
        <p class="daily-prompt board-overlay">
            <img src={wordmark} alt="Choodle" height="16" width="55" /><br/>
            <span>{prompt.prompt}</span>
        </p>
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
        border-radius: 1.5rem;
        background: var(--color-primary);
        /* box-shadow: 0px 0px 20px 10px hsla(0, 0%, 0%, 0.1); */
        box-shadow: 0px 0.3em 1.5em rgba(0, 0, 0, 0.1); 
        z-index: 999;
        position: absolute;
        display: block;
        margin: 0 auto;
        top: 1em;
        left: 1em;
        right: 1em;
    }
    .daily-prompt {
        font-weight: 700;
        padding: 0.5em;
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
