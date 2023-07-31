<script lang="ts">
    import {urlFor} from "$lib/PersistedImagesUtils"
    import {page} from "$app/stores";
    import Button from "../../../components/Button.svelte";
    import handDraw from "$lib/assets/hand-draw.svg"
    import send from "$lib/assets/send.svg"
    import {browser} from "$app/environment";
    import MetaData from "../../../components/MetaData.svelte";
    import {goto} from "$app/navigation";
    import {clearStorage} from "$lib/StorageStuff";
    import {toHTML} from "@portabletext/to-html";
    import * as Configuration from "$lib/Configuration";
	import Wordmark from "../../../components/Wordmark.svelte";

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

<choodle>
    <h1>
        <Wordmark/>
    </h1>
    {#if data.choodle }
        {@html topContent()}
        <img class="choodle" src={urlFor(data.choodle.image)} width={330} height={330}/>
        {@html bottomContent()}
    {:else}
        <p>No choodle found.</p>
    {/if}
</choodle>

<menu>
    <Button on:click={clearAndStartOver} icon={handDraw}>Draw</Button>
    {#if canShare()}
        <Button on:click={share} icon={send}>Share</Button>
    {/if}
</menu>

<style>
    :root {
        background: var(--choodle-yellow);
    }

    main, menu {
        text-align: center;
        padding: 0 2rem;
    }

    menu {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    img.choodle {
        margin: 1rem;
        max-height: 40%;
        width: auto;
        max-width: 80%;
        image-rendering: pixelated;
        object-fit: contain;

        border-radius: 0.22175rem;
        background: lightgray 0px -1.601px / 100% 105.839% no-repeat, #FFF;
        box-shadow: 1px 1px 17.74193572998047px 0.8870968222618103px rgba(0, 0, 0, 0.12);
    }
</style>
