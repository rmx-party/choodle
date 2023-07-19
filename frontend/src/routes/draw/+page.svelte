<script lang="ts">
    import {loading} from "$lib/store";
    import LoadingIndicator from "../../LoadingIndicator.svelte";
    import ChoodleBoard from "../../ChoodleBoard.svelte";

    export let data;
</script>

{#if !$loading}
    <ChoodleBoard id="choodle-board" prompt={data.prompt}></ChoodleBoard>
{:else}
    <LoadingIndicator></LoadingIndicator>
{/if}
