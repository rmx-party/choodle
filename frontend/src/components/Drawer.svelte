<script lang="ts">
    import { cubicOut } from "svelte/easing";
    import Wordmark from "../components/Wordmark.svelte"
    import { tweened } from "svelte/motion";

    export let content = '<h1>html contents</h1><p>html from cms</p>'
    export let prompt = 'prompt'

    let toggleState: 'minimized' | 'closed' | 'open' = 'closed';

    const contentHeight = tweened(1, {
        duration: 3000,
        easing: cubicOut
    })

    const handleTap = (event) => {
        if (toggleState == 'open') {
            toggleState = 'closed';
            $contentHeight = 0;
        } else if (toggleState == 'closed') {
            toggleState = 'minimized'
            $contentHeight = 0;
        } else if (toggleState == 'minimized') {
            toggleState = 'open'
            $contentHeight = 100;
        }
        console.log(`drawer toggle`, event, toggleState)
    }
</script>

<div id="drawer" class={toggleState}>
    <section class="drawer-content" style:height={`${$contentHeight * 100}%`}>
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
        height: auto;
        overflow: hidden;
    }

    .drawer-content {
        /* height: 0; */
        overflow: hidden;
        transition: height 0.5s;
    }
    .open .drawer-content {
        height: auto;
    }
    .drawer-prompt {
        /* height: auto; */
    }
    .minimized .drawer-prompt {
        /* height: 0; */
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
