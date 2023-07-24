<script lang="ts">
    import {loading} from "$lib/store";
    import LoadingIndicator from "../../LoadingIndicator.svelte";
    import ChoodleBoard from "../../ChoodleBoard.svelte";
    import {page} from "$app/stores";
    import opengraphChoodle from '$lib/assets/OpenGraph-Choodle-630x630-2x.png';
    import MetaData from "../../MetaData.svelte";

    export let data;
</script>

<MetaData url={$page.url}
          title="Choodle a doodle?"
          imageUrl={opengraphChoodle}
          width="630"
          height="630"
          description="Draw something that lasts forever. Express yourself with lo-fi doodles that are yours to keep, sell, or share."/>

{#if !$loading}
    <ChoodleBoard id="choodle-board" prompt={data.prompt}></ChoodleBoard>
{:else}
    <LoadingIndicator></LoadingIndicator>
{/if}
