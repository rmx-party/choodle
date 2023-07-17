<script lang="ts">
    import {loading} from "$lib/store";
    import LoadingIndicator from "../LoadingIndicator.svelte";

    import ChoodleBoard from "../ChoodleBoard.svelte";
    import ChoodleBoardButtons from "../ChoodleBoardButtons.svelte";
</script>

{#if !$loading}
    <ChoodleBoardButtons></ChoodleBoardButtons>
    <ChoodleBoard id="choodle-board"></ChoodleBoard>
{:else}
    <LoadingIndicator></LoadingIndicator>
{/if}

