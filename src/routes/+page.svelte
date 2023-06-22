<div id="buttons">
    <button id="undo" on:click={undo}>Undo</button>
    <button id="redo" on:click={redo}>Redo</button>
    <button id="clear-board" on:click={clear}>Clear</button>
    <a id="download" href="/api/download">Download</a>
    <!-- <button id="mint" on:click={mint}>Mint</button> -->
    {#if canShare()}
        <button id="share" on:click={share}>Share</button>
    {/if}
</div>
<canvas id="choodle-board"></canvas>

<script lang="ts">
    import {clear, initialize, redo, share, undo, canShare} from "$lib/CanvasStuff.ts";
    import {browser} from "$app/environment";

    initialize()
</script>
