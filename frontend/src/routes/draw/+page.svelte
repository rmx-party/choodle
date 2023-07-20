<script lang="ts">
    import {loading} from "$lib/store";
    import LoadingIndicator from "../../LoadingIndicator.svelte";
    import ChoodleBoard from "../../ChoodleBoard.svelte";
    import {page} from "$app/stores";
    import opengraphChoodle from '$lib/assets/OpenGraph-Choodle-630x630-2x.png';
    import {urlFor} from "$lib/PersistedImagesUtils";
    import MetaData from "../../MetaData.svelte";

    export let data;
</script>

<MetaData url={$page.url}
          title="Choodle"
          imageUrl={opengraphChoodle}
          width="630"
          height="630"
          description="Draw something that lasts forever. Express yourself with lo-fi doodles that are yours to keep, sell, or share."/>

<div id="container">
    {#if !$loading}
        <ChoodleBoard id="choodle-board" prompt={data.prompt}></ChoodleBoard>
    {:else}
        <LoadingIndicator></LoadingIndicator>
    {/if}
</div>

<style>
    #container {
        position: absolute;
        overflow: hidden; /* Avoid scrollbars */
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
    }
</style>
