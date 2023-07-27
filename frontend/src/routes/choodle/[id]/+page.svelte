<script lang="ts">
    import {urlFor} from "$lib/PersistedImagesUtils"
    import {page} from "$app/stores";
    import Button from "../../../components/Button.svelte";
    import {browser} from "$app/environment";
    import MetaData from "../../../components/MetaData.svelte";
    import {goto} from "$app/navigation";
    import {clearStorage} from "$lib/StorageStuff";
    import {toHTML} from "@portabletext/to-html";

    export let data = {};

    const canShare = async (): Promise<boolean> => {
        if (browser) return navigator.canShare(await generateShareable())
        return false
    }

    const generateFilesArray = async () => {
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
        return files;
    }

    const generateShareable = async () => {
        return {
            files: await generateFilesArray(),
            title: 'Choodle',
            url: $page.url
        }
    }

    const share = async (event: Event) => {
        event.preventDefault()

        console.log('page url: ', $page.url)
        if (navigator.share) {
            navigator.share(await generateShareable()).then(() => {
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

    const topContent = () => {
        if (data.copy?.top) {
            return toHTML(data.copy.top)
        }
        return ''
    }

    const bottomContent = () => {
        if (data.copy?.bottom) {
            return toHTML(data.copy.bottom)
        }
        return ''
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
        {@html topContent()}
        <img src={urlFor(data.choodle.image)}/>
        {@html bottomContent()}
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
