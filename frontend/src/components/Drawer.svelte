<script lang="ts">
    export let content = '<h1>html contents</h1><p>html from cms</p>'
    export let prompt = 'Draw: prompt'

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
    <section class="drawer-prompt">
        {prompt}
    </section>
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
    }

    .drawer-content {
        height: 0;
        overflow: hidden;
    }
    .open .drawer-content {
        height: auto;
    }
    .drawer-prompt {
        height: auto;
    }
    .minimized .drawer-prompt {
        height: 0;
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
</style>
