<script lang="ts">
    import {loading, tokenId} from "$lib/store";
    import LoadingIndicator from "../LoadingIndicator.svelte";

    import ChoodleBoard from "../ChoodleBoard.svelte";
    import ChoodleBoardButtons from "../ChoodleBoardButtons.svelte";
</script>

{#if !$loading}
    <ChoodleBoardButtons></ChoodleBoardButtons>
    <ChoodleBoard></ChoodleBoard>
{:else}
    <LoadingIndicator></LoadingIndicator>
{/if}

