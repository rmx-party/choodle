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
    </section>
    <section class="drawer-prompt">
        <hr/>
        {prompt}
    </section>
    <button on:click|preventDefault={handleTap}>
        toggle me
    </button>
</div>

<style>
    #drawer {
        position: fixed;
        top: 0;
        width: 100%;
        z-index: 99999;

        background-color: var(--color-primary);
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
    }
</style>
