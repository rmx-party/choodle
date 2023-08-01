<script lang="ts">
    import {loading} from "$lib/store";
    import LoadingIndicator from "../../components/LoadingIndicator.svelte";
    import ChoodleBoard from "../../components/ChoodleBoard.svelte";
    import MetaData from "../../components/MetaData.svelte";
    import {page} from "$app/stores";
    import opengraphChoodle from '$lib/assets/OpenGraph-Choodle-1200x630-2x.jpg';

    export let data;
</script>

<MetaData
    url={$page.url}
    title="Choodle a doodle?"
    imageUrl={opengraphChoodle}
    imageAlt="Cursive writing of the word “Choodle” with doodle stars and a smiley face on a yellow background"
    width="1200"
    height="630"
    description="Draw something that lasts forever. Express yourself with lo-fi doodles that are yours to keep, sell, or share."/>

{#if !$loading}
    <ChoodleBoard id="choodle-board" prompt={data.prompt} howto={data.howto}></ChoodleBoard>
{:else}
    <LoadingIndicator explanation="saving choodle"></LoadingIndicator>
{/if}
