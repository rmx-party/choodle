<script lang="ts">
    import {goto} from '$app/navigation';
    import Button from '../components/Button.svelte';
    import MetaData from '../components/MetaData.svelte';
    import Wordmark from "../components/Wordmark.svelte";
    import {toHTML} from "@portabletext/to-html";
    import handDraw from "$lib/assets/hand-draw.svg";

    export let data;

    console.log(data)
</script>


<MetaData
        title="How to Choodle"
        themeColor="#FEF40A"
/>

<main id="main">
    <Wordmark fontSize="4rem"/>

    <content id="content">
        {@html toHTML(data.howto.howto)}
    </content>

    <Button variant="primary" icon={handDraw} on:click={() => {goto('/draw')}}>
        Let's Draw!
    </Button>

    <content id="bottom">
        {@html toHTML(data.howto.bottom)}
    </content>
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


