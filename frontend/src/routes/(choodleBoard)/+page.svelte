<script lang="ts">
    import {loading} from "$lib/store";
    import LoadingIndicator from "../../LoadingIndicator.svelte";
    import ChoodleBoard from "../../ChoodleBoard.svelte";
</script>

{#if !$loading}
    <ChoodleBoard id="choodle-board"></ChoodleBoard>
{:else}
    <LoadingIndicator></LoadingIndicator>
{/if}
