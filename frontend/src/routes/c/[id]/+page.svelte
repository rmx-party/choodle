<script lang="ts">
    import {urlFor} from "$lib/PersistedImagesUtils"
    import {page} from "$app/stores";
    import Button from "../../../components/Button.svelte";
    import handDraw from "$lib/assets/hand-draw.svg"
    import send from "$lib/assets/send.svg"
    import MetaData from "../../../components/MetaData.svelte";
    import {goto} from "$app/navigation";
    import {clearStorage} from "$lib/StorageStuff";
    import {toHTML} from "@portabletext/to-html";
    import Wordmark from "../../../components/Wordmark.svelte";
    import {onMount} from "svelte";
    import {browser} from "$app/environment";

    export let data = {};
    let imgBlob;

    const canShare = (): boolean => {
        console.log('canshare')
        console.log(imgBlob)
        if (!browser) return false;
        if (!navigator.share) return false;
        return navigator.canShare(generateShareableFor(imgBlob))
    }

    function generateFilesFor(imgBlob: Blob) {
        return [
            new File(
                [imgBlob],
                'c.png',
                {
                    type: 'image/png',
                    lastModified: Date.now()
                }
            )
        ];
    }

    onMount(async () => {
        const img: unknown = urlFor(data.choodle.upScaledImage);
        imgBlob = await (await fetch(img as URL)).blob();
    })

    function generateShareableFor(files: File[]) {
        return {
            files,
            title: 'Choodle',
            url: $page.url
        };
    }

    const share = async (event: Event) => {
        if (!browser) return;
        event.preventDefault()
        // TODO: maybe remove files from this share once opengraph metadata is
        // hooked up
        const files = generateFilesFor(imgBlob);
        console.log('page url: ', $page.url)
        if (navigator.share) {
            navigator.share(generateShareableFor(files)).then(() => {
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
        if (data.copy?.tagline) {
            return toHTML(data.copy.tagline)
        }
        return ''
    }

    const bottomContent = () => {
        if (data.copy?.bottom) {
            return toHTML(data.copy.bottom)
        }
        return ''
    }

    const resetViewportUnit = async () => {
        if (!browser) return;
        // https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    setTimeout(async () => {
        await resetViewportUnit()
    }, 50);
</script>

<MetaData url={$page.url}
          title="Look, it's a choodle"
          imageUrl={urlFor(data.choodle.upScaledImage)}
          width="430"
          height="932"
/>

<div class="container">
    <div id="top-box">
        <a href="/">
            <Wordmark fontSize="4.25rem"/>
        </a>
        <span class="tagline">
            {@html topContent()}
        </span>
    </div>
    <div class="choodle-container">
        <img class="choodle" src={urlFor(data.choodle.upScaledImage)}
            width='390' height='520' alt=''/>
    </div>
    <section class="content">
        <!-- {@html bottomContent()} -->
        <p>Get your sticker at the Art Center.
        <br/>
            Wanna mint? Email: 
            <a
                href={`mailto:fwb@choodle.xyz?subject=Please mint my choodle&body=My choodle can be found at ${$page.url}`}>fwb@choodle.xyz</a>
        </p>
    </section>

    <menu>
        <Button on:click={clearAndStartOver} icon={handDraw}>Draw</Button>
        {#if canShare()}
            <Button on:click={share} icon={send} iconPosition='right'>Share</Button>
        {/if}
    </menu>
</div>

<style>
    :root {
        background: var(--choodle-yellow);
        text-align: center;
    }

    .container {
        /* gap: 2rem; */
        padding: 1rem 1rem;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        align-content: stretch;
        align-items: stretch;
        justify-content: space-between;
        height: 100vh;
        height: calc(var(--vh, 1vh) * 100); /* https://css-tricks.com/the-trick-to-viewport-units-on-mobile/ */
        width: 100%;
        padding: 1.5rem;
    }

    menu {
        display: flex;
        flex-direction: row;
        margin: 1rem 0;
        padding: 0;
        gap: 1rem;
    }

    .choodle-container {
        flex-grow: 1;
        margin: 2rem auto;
        display: flex;
        align-items: center;
        padding: 0;
        flex-grow: 1;
        flex-shrink: 1;
        max-height: 50%;
        max-width: 100%;
        aspect-ratio: 3/4;
    }
    img.choodle {
        flex-shrink: 1;
        flex-grow: 1;
        max-height: 100%;
        max-width: 100%;
        image-rendering: pixelated;

        border-radius: 0.22175rem;
        box-shadow: 1px 1px 17.74193572998047px 0.8870968222618103px rgba(0, 0, 0, 0.12);
    }

    .tagline {
        margin-top: 0rem;
    }
</style>
