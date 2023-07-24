<script lang="ts">
    import {urlFor} from "$lib/PersistedImagesUtils"
    import {page} from "$app/stores";
    import Button from "../../../Button.svelte";
    import {browser} from "$app/environment";
    import MetaData from "../../../MetaData.svelte";
    import {goto} from "$app/navigation";
    import {clearStorage} from "$lib/StorageStuff";

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
                title: 'Choodle',
                url: $page.url
            }).then(() => {
                console.log('Thanks for sharing!');
            }).catch(console.error);
        } else {
            console.error('Web Share API not supported')
        }
    };

    const clearAndStartOver = async () => {
        clearStorage()
        await goto("/draw")
    }
</script>

<MetaData url={$page.url}
    title="Look, it's a choodle"
    imageUrl={urlFor(data.choodle.image)}
    width="430"
    height="932" 
/>

<main>
    {#if data.choodle }
        <img src={urlFor(data.choodle.image)}/>
        <p>Save your Choodle as a photo, send it to a friend, and keep choodling.</p>
    {:else}
        <p>No choodle found.</p>
    {/if}
</main>

<menu>
    <Button on:click={clearAndStartOver}>make more choodles</Button>
    {#if canShare()}
        <Button variant="primary" on:click={share}>share</Button>
    {/if}
</menu>

<style>
    main, menu {
        text-align: center;
        padding: 0 2rem;
    }

    menu {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    img {
        width: 70%;
        image-rendering: pixelated;
    }
</style>
