<script>
    import Button from "../components/Button.svelte";


    import Wordmark from "../components/Wordmark.svelte";
    import {goto} from "$app/navigation";
    import MetaData from "../components/MetaData.svelte";

    function reload() {
        window.location.reload(true)
    }

    const resetViewportUnit = async () => {
        // https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    setTimeout(async () => {
        await resetViewportUnit()
    }, 100);
</script>

<MetaData title="Oops!" themeColor="#fff"/>

<div class="container">
    <div id="top-box">
        <h1>Oops!</h1>
        <p>Something got lost on our end. <br/>Retry again soon.</p>
    </div>

    <img class="error-image" height="263" width="174" src='/choodle-bob-p2.png'
         alt="A doodle of the painter Bob Ross, slightly smiling"/>

    <Button variant="big primary" on:click={() => goto('/')}>Retry</Button>

    <p>Having trouble? <a href="mailto:help@choodle.xyz">Email us</a></p>

    <footer>
        <Wordmark/>
        © 2023
    </footer>
</div>

<style>
    :root {
        color: var(--choodle-black, #141518);
        text-align: center;
        line-height: 120%; /* 1.35rem */
    }

    .container {
        height: 100%;
        height: calc(var(--vh, 1vh) * 100); /* https://css-tricks.com/the-trick-to-viewport-units-on-mobile/ */
        width: 100%;
        padding: 1rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        flex-direction: column;
        flex-wrap: nowrap;
    }

    img {
        margin-top: 2rem;
        margin-bottom: 1.5rem;
        object-fit: contain;
    }

    pre {
        text-align: left;
        white-space: pre-wrap;
        margin: 2rem auto;
        display: block;
    }

    footer {
        flex-grow: 1;
        margin: 0 auto;
        width: 100%;
        text-align: center;

        color: #000;
        font-size: 0.875rem;
        font-style: normal;
        font-weight: 400;
        line-height: 120%; /* 1.05rem */
    }
</style>
