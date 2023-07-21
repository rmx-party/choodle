<script lang="ts">
    import wordmark from '$lib/assets/choodle-wordmark.png';
    import Button from '../../Button.svelte';
    import {toHTML} from "@portabletext/to-html";

    export let data;

    console.log(data)
</script>

<main id="main">

    <h1>
        How to <img class="wordmark" src={wordmark} alt="Choodle"/>
    </h1>

    <content id="content">
        {@html toHTML(data.howto.howto)}
    </content>

    <a class="cta" href="/draw">
        <Button class="cta" variant="primary">
            Let's Draw!
        </Button>
    </a>
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
