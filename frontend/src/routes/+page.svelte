<script lang="ts">
    import {loading, tokenId} from "$lib/store";
    import LoadingIndicator from "../LoadingIndicator.svelte";

    import {
        initialize
    } from "$lib/CanvasStuff.ts";
    import ChoodleBoard from "../ChoodleBoard.svelte";
    import ChoodleBoardButtons from "../ChoodleBoardButtons.svelte";

    initialize()
</script>

{#if !$loading}
    <ChoodleBoardButtons></ChoodleBoardButtons>
    <ChoodleBoard></ChoodleBoard>
{:else}
    <LoadingIndicator></LoadingIndicator>
{/if}

