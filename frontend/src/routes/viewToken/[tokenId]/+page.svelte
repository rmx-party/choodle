<script lang="ts">
    import {urlFor} from "$lib/PersistedImagesUtils"

    export let data = [];
</script>

{#if data.choodle }
    <h1>{data.choodle[0].title}</h1>
    <img src={urlFor(data.choodle[0].image)}/>
{:else}
    <p>No choodle found.</p>
{/if}
