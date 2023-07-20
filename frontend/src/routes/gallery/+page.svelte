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
    <meta property="og:title" content="Choodle"/>
    <meta property="og:image" content={opengraphChoodle}/>
    <meta property="og:image:secure_url" content={opengraphChoodle}/>
    <meta property="og:image:width" content="630"/>
    <meta property="og:image:height" content="630"/>
    <meta property="og:image:alt" content="Choodle"/>
    <meta property="og:description"
          content="Draw something that lasts forever. Express yourself with lo-fi doodles that are yours to keep, sell, or share."/>
    <meta name="description"
          content="Draw something that lasts forever. Express yourself with lo-fi doodles that are yours to keep, sell, or share."/>
</svelte:head>

<h1>Choodle Gallery</h1>
{#if data.choodles && data.choodles.length > 0}
    <ul class="gallery">
        {#each data.choodles as choodle (choodle)}
            <li>
                <a href="/choodle/{choodle._id}">{choodle.title}</a>
                <a href="/choodle/{choodle._id}">
                    <img alt={choodle.title} src={urlFor(choodle.image)} height="30" width="30"/>
                </a>
            </li>
        {/each}
    </ul>
{:else}
    <p>No choodle found.</p>
{/if}

<style>
    .gallery {
        padding: 1em;
    }

    .gallery li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: row;
        flex-wrap: nowrap;
        margin: 0.25em 0;
    }

    .gallery img {
        object-fit: cover;
    }
</style>
