<script lang="ts">
    import Wordmark from "../components/Wordmark.svelte"

    export let content = `<h1>html contents</h1><p>html from
        cms</p><p>foo</p><p>foo</p>`
    export let prompt = 'prompt'

    let toggleState: 'minimized' | 'closed' | 'open' = 'closed';

    const handleTap = (event) => {
        if (toggleState == 'open') {
            toggleState = 'closed';
        } else if (toggleState == 'closed') {
            toggleState = 'minimized'
        } else if (toggleState == 'minimized') {
            toggleState = 'open'
        }
        console.log(`drawer toggle`, event, toggleState)
    }
</script>

<div id="drawer" class={toggleState}>
    <section class="drawer-content">
        {@html content}
        <hr/>
    </section>

    {#if prompt}
        <section class="drawer-prompt">
            <Wordmark fontSize="2rem" />
            <br/>
            <strong>Draw:</strong> ‘{prompt}’ (icon)
        </section>
    {/if}

    <button class="drag-zone" on:click|preventDefault={handleTap}>
        <div class="drawer-pull">pull</div>
    </button>
</div>

<style>
    #drawer {
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
    #drawer.minimized {
        top: -46%;
    }
    #drawer.closed {
        top: -34%;
    }
    #drawer.open {
        top: 0;
    }

    .drawer-content {
        max-height: 60vh;
        overflow: scroll-y;
    }
    .drawer-prompt {
        max-height: 6.5rem;
        overflow: hidden;
        text-align: center;
    }

    .drag-zone {
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
        border-top: 1px;
        border-color: rgba(0, 0, 0, 0.10);
        width: 100%;
    }
    strong {
        font-family: 'Dejavu Sans Bold';
        font-weight: 700;
    }
</style>
