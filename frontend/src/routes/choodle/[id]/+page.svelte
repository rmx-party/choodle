<script lang="ts">
    import {urlFor} from "$lib/PersistedImagesUtils"
    import {page} from "$app/stores";

    export let data = {};
</script>

<svelte:head>
    <!-- TODO: set canonical URL (decide trailing slash etc) -->
    <meta property="og:type" content='website'/>
    <meta property="og:url" content={$page.url}/>
    <meta property="og:site_name" content="Choodle"/>
    <title>{data.choodle.title}</title>
    <meta property="og:title" content={data.choodle.title}/>
    <meta property="og:image" content={urlFor(data.choodle.image)}/>
    <meta property="og:image:secure_url" content={urlFor(data.choodle.image)}/>
    <meta property="og:image:width" content="430"/>
    <meta property="og:image:height" content="932"/>
    <meta property="og:image:alt" content={data.choodle.title}/>
    <meta property="og:description" content={data.choodle.title}/>
    <meta name="description" content={data.choodle.title}/>
</svelte:head>

{#if data.choodle }
    <h1>{data.choodle.title}</h1>
    <img src={urlFor(data.choodle.image)}/>
{:else}
    <p>No choodle found.</p>
{/if}

<footer>
    <a href="/draw">make more choodles</a>
</footer>

<style>
    footer {
        width: 100%;
    }
</style>
