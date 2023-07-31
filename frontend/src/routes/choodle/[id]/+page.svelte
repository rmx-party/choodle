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

<div class="container">
    <Wordmark fontSize="3.5rem"/>
    {#if data.choodle }
        {@html topContent()}
        <img class="choodle" src={urlFor(data.choodle.image)} width={330} height={330}/>
        <section class="content">
            {@html bottomContent()}
        </section>
    {:else}
        <p>No choodle found.</p>
    {/if}

    <menu>
        <Button on:click={clearAndStartOver} icon={handDraw}>Draw</Button>
        <Button on:click={share} icon={send} iconPosition='right'>Share</Button>
    </menu>
</div>

<style>
    :root {
        background: var(--choodle-yellow);
        text-align: center;
    }

    .container {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        align-content: stretch;
        align-items: stretch;
        height: 100%;
        width: 100%;
        max-height: 100vh;
        gap: 1rem;
    }

    menu {
        display: flex;
        flex-direction: row;
        margin: 0;
        padding: 0;
    }

    img.choodle {
        flex-grow: 1;
        margin: 0 auto;
        max-height: 60%;
        width: auto;
        max-width: 100%;
        image-rendering: pixelated;
        object-fit: contain;

        border-radius: 0.22175rem;
        box-shadow: 1px 1px 17.74193572998047px 0.8870968222618103px rgba(0, 0, 0, 0.12);
    }
</style>
