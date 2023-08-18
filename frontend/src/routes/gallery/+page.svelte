<script lang="ts">
    import {urlFor} from "$lib/PersistedImagesUtils"
    import {page} from "$app/stores";
    import opengraphChoodle from '$lib/assets/OpenGraph-Choodle-630x630-2x.png';
    import MetaData from "../../components/MetaData.svelte";

    export let data = {};
</script>

<MetaData url={$page.url}
          title="Choodle"
          imageUrl={opengraphChoodle}
          width="630"
          height="630"
          description="Draw something that lasts forever. Express yourself with lo-fi doodles that are yours to keep, sell, or share."/>

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
