<script lang="ts">
    import {goto} from '$app/navigation';
    import Button from '../components/Button.svelte';
    import MetaData from '../components/MetaData.svelte';
    import Wordmark from "../components/Wordmark.svelte";
    import {toHTML} from "@portabletext/to-html";
    import handDraw from "$lib/assets/hand-draw.svg";
    import star1 from "$lib/assets/star-1.png";
    import star2 from "$lib/assets/star-2.png";
    import opengraphChoodle from '$lib/assets/OpenGraph-Choodle-1200x630-2x.jpg';
	import { page } from '$app/stores';

    export let data;

    console.log(data)
</script>


<MetaData
    title="How to Choodle"
    themeColor="#FEF40A"
    url={$page.url}
    imageUrl={opengraphChoodle}
    imageAlt="Cursive writing of the word “Choodle” with doodle stars and a smiley face on a yellow background"
    width="1200"
    height="630"
    description="Draw something that lasts forever. Express yourself with lo-fi doodles that are yours to keep, sell, or share."/>

<main id="main">
    <Wordmark fontSize="4rem"/>
    <p><img width="22" height="17" src={star1} alt="a doodle of a star"/>FWB Fest 2023<img width="22" height="17"
                                                                                           src={star2}
                                                                                           alt="a doodle of a star"/>
    </p>

    <content id="content">
        {@html toHTML(data.howto.top)}
    </content>

    <Button variant="primary" icon={handDraw} on:click={() => {goto('/draw')}}>
        Let's Draw!
    </Button>

    Choodle is a canvas for in-chain creativity. Read the FAQ.
</main>

<style>
    main {
        background: var(--color-primary);
        padding: 3rem;
        margin: 0;
        min-width: 100vw;
        min-height: 100vh;
        text-align: center;
    }
</style>


