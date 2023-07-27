<script lang="ts">
    import {loading} from "$lib/store";
    import LoadingIndicator from "../../components/LoadingIndicator.svelte";
    import ChoodleBoard from "../../components/ChoodleBoard.svelte";
    import MetaData from "../../components/MetaData.svelte";
    import {page} from "$app/stores";
    import opengraphChoodle from '$lib/assets/OpenGraph-Choodle-630x630-2x.png';

    export let data;
</script>

<MetaData
        url={$page.url}
        title="Choodle a doodle?"
        imageUrl={opengraphChoodle}
        width="630"
        height="630"
        themeColor="#FEF40A"
        description="Draw something that lasts forever. Express yourself with lo-fi doodles that are yours to keep, sell, or share."/>

{#if !$loading}
    <ChoodleBoard id="choodle-board" prompt={data.prompt} howto={data.howto}></ChoodleBoard>
{:else}
    <LoadingIndicator explanation="saving choodle"></LoadingIndicator>
{/if}
