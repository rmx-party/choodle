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
          imageUrl={urlFor(data.choodle.upScaledImage)}
          width="430"
          height="932"
/>

<div class="container">
    <Wordmark fontSize="3.5rem"/>
    {#if data.choodle }
        {@html topContent()}
        <img class="choodle" src={urlFor(data.choodle.upScaledImage)}
             width='330' height='330' alt=''/>
        <section class="content">
            <p>Get your sticker at the Art Center.</p>
            <br/>
            <p>Wanna mint? Email: <a
                    href={`mailto:fwb@choodle.xyz?subject=Please mint my choodle&body=My choodle can be found at ${$page.url}`}>fwb@choodle.xyz</a>
            </p>
        </section>
    {:else}
        <p>No choodle found.</p>
    {/if}

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
        padding: 1rem 1rem 130px;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        align-content: stretch;
        align-items: stretch;
        height: 100vh;
        width: 100%;
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
        flex-shrink: 1;
        margin: 1.5rem auto;
        max-height: 40vh;
        width: auto;
        max-width: 100%;
        image-rendering: pixelated;
        object-fit: contain;

        border-radius: 0.22175rem;
        box-shadow: 1px 1px 17.74193572998047px 0.8870968222618103px rgba(0, 0, 0, 0.12);
    }
</style>
