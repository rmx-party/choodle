<script lang="ts">
    import {goto} from '$app/navigation';
    import Button from '../components/Button.svelte';
    import MetaData from '../components/MetaData.svelte';
    import Wordmark from "../components/Wordmark.svelte";
    import {toHTML} from "@portabletext/to-html";
    import handDraw from "$lib/assets/hand-draw.svg";
    import star1 from "$lib/assets/star-1.png";
    import star2 from "$lib/assets/star-2.png";

    export let data;

    console.log(data)
</script>


<MetaData
        title="How to Choodle"
        themeColor="#FEF40A"
/>

<main id="main">
    <Wordmark fontSize="4rem"/>
    <p><img src={star1} alt="a doodle of a star"/>FWB Fest 2023<img src={star2} alt="a doodle of a star"/></p>

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


