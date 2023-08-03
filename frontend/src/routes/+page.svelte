<script lang="ts">
    import {goto} from '$app/navigation';
    import Button from '../components/Button.svelte';
    import MetaData from '../components/MetaData.svelte';
    import Wordmark from "../components/Wordmark.svelte";
    import {toHTML} from "@portabletext/to-html";
    import handDraw from "$lib/assets/hand-draw-filled-40px.svg";
    import star1 from "$lib/assets/star-1.png";
    import star2 from "$lib/assets/star-2.png";
    import opengraphChoodle from '$lib/assets/OpenGraph-Choodle-1200x630-2x.jpg';
    import {page} from '$app/stores';

    export let data;

    console.log(data)
</script>


<MetaData
        title="Choodle"
        themeColor="#FEF40A"
        url={$page.url}
        imageUrl={opengraphChoodle}
        imageAlt="Cursive writing of the word “Choodle” with doodle stars and a smiley face on a yellow background"
        width="1200"
        height="630"
        description="Draw something that lasts forever. Express yourself with lo-fi doodles that are yours to keep, sell, or share."/>

<main id="main">
    <div id="top-box">
        <Wordmark fontSize="88px"/>
        <p class="tagline"><strong><img width="22" height="17" src={star1} alt="a doodle of a star"/>FWB Fest 2023<img
                width="22"
                height="17"
                src={star2}
            alt="a doodle of a star"/>
            </strong>
        </p>
    </div>

    <content id="content">
        {@html toHTML(data.howto.top)}
    </content>

    <Button variant="primary" icon={handDraw} on:click={() => {goto('/draw')}}>
        Let's Draw!
    </Button>

    <p id="bottom-content">Choodle is a canvas for in-chain creativity. Read the <a href="https://rmxparty.notion.site/Choodle-FAQ-f2f50cf66a484ee79f9d5657d6c0e7d1"
                                                                                    target="_blank">FAQ</a>.</p>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        gap: 4rem;
        background: var(--color-primary);
        padding: 1.5rem;
        margin: 0;
        min-width: 100vw;
        height: 100vh;
        text-align: center;
    }

    .tagline {
        margin-top: 0rem;
    }

    #bottom-content {
        color: rgba(20, 21, 24, 0.8);
    }
</style>


