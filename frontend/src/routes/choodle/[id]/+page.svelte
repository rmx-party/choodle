<script lang="ts">
    import {urlFor} from "$lib/PersistedImagesUtils"
    import {page} from "$app/stores";
    import Button from "../../../Button.svelte";
    import {browser} from "$app/environment";

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
                //files,
                url: $page.url
            }).then(() => {
                console.log('Thanks for sharing!');
            }).catch(console.error);
        } else {
            console.error('Web Share API not supported')
        }
    };
</script>

<svelte:head>
    <!-- TODO: set canonical URL (decide trailing slash etc) -->
    <meta property="og:type" content='website'/>
    <meta property="og:url" content={$page.url}/>
    <meta property="og:site_name" content="Choodle"/>
    <title>{data.choodle.title}</title>
    <meta property="og:title" content={data.choodle.title}/>
    <meta property="og:image" content={urlFor(data.choodle.image)}/>
    <meta property="og:image:secure_url" content={urlFor(data.choodle.image)}/>
    <meta property="og:image:width" content="430"/>
    <meta property="og:image:height" content="932"/>
    <meta property="og:image:alt" content={data.choodle.title}/>
    <meta property="og:description" content={data.choodle.title}/>
    <meta name="description" content={data.choodle.title}/>
</svelte:head>

{#if data.choodle }
    <h1>{data.choodle.title}</h1>
    <img src={urlFor(data.choodle.image)}/>
{:else}
    <p>No choodle found.</p>
{/if}

<footer>
    <a href="/draw">make more choodles</a>
    {#if canShare()}
        <Button handler={share}>share</Button>
    {/if}

</footer>

<style>
    footer {
        width: 100%;
    }
</style>
