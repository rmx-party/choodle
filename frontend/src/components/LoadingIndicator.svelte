<script lang="ts">
    import {loading} from "$lib/store";
    import AnimatedEllipses from "./AnimatedEllipses.svelte";

    loading.subscribe(value => {
        console.log(`loading state: `, value)
    })

    export let explanation = "";
</script>

{#if $loading}
    <div class="LoadingIndicator">
        <div class="loading">
            <img class="loading-image" height="263" width="174" src='/choodle-bob-p2.png'
                 alt="A doodle of the painter Bob Ross, slightly smiling"/>
            <strong>
                <span>{explanation}<AnimatedEllipses/></span>
            </strong>
        </div>
    </div>
{:else}
    <span class="not-loading">
        not loading
    </span>
{/if}

<style>
    :root {
        --light-color: rgba(10, 10, 220, .2);
        --dark-color: rgba(10, 10, 220, 1);
        --radius: 64px;
        --ring-width: 4px;

        text-align: center;
        position: relative;
    }

    /* loading element style */
    .loading {
        z-index: 9999;
        position: absolute;
        top: 0;
        left: 0;
        height: 100vh;
        width: 100vw;
        margin: 0;
        padding: 0;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }

    strong {
        margin-top: 2.5rem;
        text-align: left;
    }

    .loading-image {
        margin-top: -75px;
    }

    .not-loading {
        display: none;
    }
</style>

