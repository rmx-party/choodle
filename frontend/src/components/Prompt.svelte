<script lang="ts">
    import handDraw from '$lib/assets/hand-draw-filled-40px.svg'

    export let prompt;
    export let instruction = "Draw:"
</script>


{#if prompt}
    <div class="prompt">
        <img src={handDraw}/>
        <p class="daily-prompt">
            <span><strong>{instruction} </strong>‘{prompt}’</span>
        </p>
    </div>
{:else}
    <span style="display:none;">no prompt</span>
{/if}


<style>
    .prompt {
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
