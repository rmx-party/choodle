<script lang="ts">
    import wordmark from '$lib/assets/choodle-wordmark.png';
	import Button from '../../Button.svelte';
</script>

<main id="main">

<h1>
How to <img class="wordmark" src={wordmark} alt="Choodle"/>
</h1>

<p>
(hai FWBFest 2023)
</p>

<h2>
Use Your Noodle!
</h2>
<p>
Read the prompt. To draw the prompt or not, that is the question.
</p>

<h2>
Choodle A Doodle?
</h2>
<p>
It’s not that serious. Serious!
</p>

<h2>
Share Your Choodle
</h2>
<p>
Press done to save, share, or send your Choodle!
</p>

<h2>
Want to be a beta tester?
</h2>
<p>
    Email us at <a href="mailto:vip@choodle.xyz">vip@choodle.xyz</a>
</p>

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
        width: 100vw;
        height: 100vh;
    }

    .cta {
        display: flex;
        padding: 1em;
        text-decoration: none;
        position: absolute;
        bottom: 2em;
        left: 1em;
        right: 1em;
    }
</style>
