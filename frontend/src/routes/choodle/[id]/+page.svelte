<script lang="ts">
    import {urlFor} from "$lib/PersistedImagesUtils"
    import {page} from "$app/stores";
    import Button from "../../../Button.svelte";
    import {browser} from "$app/environment";
    import MetaData from "../../../MetaData.svelte";

    export let data = {};

    const canShare = (): boolean => {
        if (browser) return !!navigator.share
        return false
    }

    const share = async (event: Event) => {
        event.preventDefault()
        const img: unknown = urlFor(data.choodle.image);
        const imgBlob = await (await fetch(img as URL)).blob();
        // TODO: maybe remove files from this share once opengraph metadata is
        // hooked up
        const files = [
            new File(
                [imgBlob],
                'choodle.png',
                {
                    type: 'image/png',
                    lastModified: Date.now()
                }
            )
        ];
        console.log('page url: ', $page.url)
        if (navigator.share) {
            navigator.share({
                files,
                url: $page.url
            }).then(() => {
                console.log('Thanks for sharing!');
            }).catch(console.error);
        } else {
            console.error('Web Share API not supported')
        }
    };
</script>

<MetaData url={$page.url}
          title={data.choodle.title}
          imageUrl={urlFor(data.choodle.image)}
          width="430"
          height="932"
          description={data.choodle.title}/>

{#if data.choodle }
    <h1>{data.choodle.title}</h1>
    <img src={urlFor(data.choodle.image)}/>
{:else}
    <p>No choodle found.</p>
{/if}

<menu>
    <a href="/draw">make more choodles</a>
    {#if canShare()}
        <Button variant="primary" handler={share}>share</Button>
    {/if}
</menu>

<style>
    menu {
        width: 100%;
        display:flex;
    }
</style>
