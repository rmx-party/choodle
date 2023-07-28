<script lang="ts">
    import { goto } from '$app/navigation';
    import Button from '../../components/Button.svelte';
    import MetaData from '../../components/MetaData.svelte';
    import Wordmark from "../../components/Wordmark.svelte";
    import {toHTML} from "@portabletext/to-html";

    export let data;

    console.log(data)
</script>


<MetaData 
    title="How to Choodle"
    themeColor="#FEF40A"
/>

<main id="main">

    <h1>
        How to <Wordmark />
    </h1>

    <content id="content">
        {@html toHTML(data.howto.howto)}
    </content>

    <Button variant="primary" on:click={() => {goto('/draw')}}>
        Let's Draw!
    </Button>
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

    .cta {
        display: flex;
        padding: 1em;
        text-decoration: none;
    }
</style>


