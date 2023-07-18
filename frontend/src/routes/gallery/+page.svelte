<script lang="ts">
    import {urlFor} from "$lib/PersistedImagesUtils"

    export let data = {};
</script>

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
    padding: 0;
}

.gallery li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
    flex-wrap: nowrap;
    margin: 0;
}
</style>
