<script lang="ts">
    export let prompt;
</script>


{#if prompt}
    <div class="anchor">
        <div class="prompt overlay">
            {prompt.prompt}
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
    .prompt {
        padding: 0.5em;
        pointer-events: none;
        text-align: center;
    }
    .overlay {
        border-radius: 0.3em;
        background: hsla(50, 100%, 60%, 0.9);
        box-shadow: 0px 0px 20px 10px hsla(0, 0%, 0%, 0.1);
        z-index: 999;
        position: absolute;
        display: block;
        margin: 1em auto;
        top: 0.2em;
        left: 1em;
        right: 1em;
    }
</style>
