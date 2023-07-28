<script lang="ts">
    import Wordmark from "../components/Wordmark.svelte"

    export let content = `<h1>html contents</h1><p>html from
        cms</p><p>foo</p><p>foo</p>`
    export let prompt = 'prompt'

    let toggleState: 'minimized' | 'closed' | 'open' = 'closed';

    const calculateElementHeights = () => {
        const handle = document.getElementsByClassName("drag-zone")[0]
        const prompt = document.getElementsByClassName("drawer-prompt")[0]
        const content = document.getElementsByClassName("drawer-content")[0]
        const handleHeight = handle.offsetHeight
        const promptHeight = prompt.offsetHeight
        const contentHeight = content.offsetHeight

        return {handleHeight, promptHeight, contentHeight}
    }

    const handleTap = (event) => {
        const heights = calculateElementHeights()
        const drawer = document.getElementById("drawer")

        if (toggleState == 'open') {
            toggleState = 'minimized'
            drawer.style.top = `${(0 - drawer.offsetHeight + heights.handleHeight)}px`.toString()
        } else if (toggleState == 'closed') {
            toggleState = 'open'
            drawer.style.top = "0px".toString()
        } else if (toggleState == 'minimized') {
            toggleState = 'closed';
            drawer.style.top = `${0 - drawer.offsetHeight + heights.promptHeight + heights.handleHeight}px`.toString()
        }
        console.warn(`drawer toggle`, event, toggleState)
    }
</script>

<div id="drawer" class={toggleState}>
    <section class="drawer-content">
        {@html content}
        <hr/>
    </section>

    <div id="clickable-area" on:click={handleTap}>
        <section class="drawer-prompt">
            {#if prompt}
                <Wordmark fontSize="2rem"/>
                <br/>
                <strong>Draw:</strong> ‘{prompt}’ (icon)
            {/if}
        </section>

        <button class="drag-zone">
            <div class="drawer-pull">pull</div>
        </button>
    </div>
</div>

<style>
    #drawer {
        margin: 0;
        position: fixed;
        top: 0;
        width: 100%;
        z-index: 99999;

        background-color: var(--color-primary);
        text-align: center;
        border-radius: 0 0 1rem 1rem;
        padding: 1rem 1rem 0;
        overflow: hidden;
        transition: top 0.3s ease-in-out;
    }

    .drawer-content {
        margin: 0;
        max-height: 60vh;
        overflow: scroll-y;
    }

    .drawer-prompt {
        margin: 0;
        padding: 0.5rem;
        max-height: 6.5rem;
        overflow: hidden;
        text-align: center;
    }

    .drag-zone {
        margin: 0;
        height: 1.5rem;
        width: 100%;
        background: none;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .drawer-pull {
        border-radius: 0.25rem;
        width: 3rem;
        height: 0.25rem;
        border: none;
        outline: none;
        background: rgba(8, 11, 9, 0.88);
        overflow: hidden;
    }

    hr {
        margin: 0;
        padding: 0;
        border-top: 1px;
        border-color: rgba(0, 0, 0, 0.10);
        width: 100%;
    }

    strong {
        font-family: 'Dejavu Sans Bold';
        font-weight: 700;
    }
</style>
