<script lang="ts">
    import {urlFor} from "$lib/PersistedImagesUtils"

    export let data = {};
</script>

{#if data.choodles && data.choodles.length > 0}
    <ul>
        {#each data.choodles as choodle (choodle)}
            <li>
                <a href="/viewToken/{choodle._id}">{choodle.title}</a>
                <img src={urlFor(choodle.image)} height="20" width="20"/>
            </li>
        {/each}
    </ul>
{:else}
    <p>No choodle found.</p>
{/if}
