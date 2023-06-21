<div id="buttons">
    <button id="undo" on:click={undo}>Undo</button>
    <button id="redo" on:click={redo}>Redo</button>
    <button id="clear-board" on:click={clear}>Clear</button>
    <button id="download" on:click={download}>Download</button>
    <button id="mint" on:click={mint}>Mint</button>
</div>
<canvas id="choodle-board"></canvas>

<script lang="ts">
    import {clear, download, initialize, mint, redo, undo} from "$lib/CanvasStuff.ts";

    initialize()
</script>
