<script lang="ts">
    import {debugInfo, debugEnabled} from "$lib/store";

    debugInfo.subscribe(value => {
        console.log('Debugging received: ', value)
    })
</script>

{#if $debugEnabled}
    <div class="DebugInfo">
        <div class="debug-info" style="white-space: pre-wrap">
            {$debugInfo}
        </div>
    </div>
{:else}
    <span class="debugInfo">
        not debugging
    </span>
{/if}

<style>
    :root {
        text-align: center;
        position: relative;
    }

    .debug-info {
        z-index: 9999;
        position: absolute;
        top: 0;
        left: 0;
        height: 100vh;
        width: 100vw;
        margin: 0;
        padding: 0;
        background: hsla(150, 0%, 90%, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }
</style>
