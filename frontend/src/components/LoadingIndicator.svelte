<script lang="ts">
    import {loading} from "$lib/store";

    loading.subscribe(value => {
        console.log(`loading state: `, value)
    })

    export let explanation = "";
</script>

{#if $loading}
    <div class="LoadingIndicator">
        <div class="loading">
            <div class="spinner"></div>
        </div>
        <p>{explanation}</p>
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
        background: hsla(150, 0%, 90%, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }

    .loading .spinner {
        margin: 0;
        padding: 0;
        width: var(--radius);
        height: var(--radius);
        border-radius: 50%;
        border: var(--ring-width) solid var(--light-color);
    }

    .loading .spinner:before {
        margin: 0;
        padding: 0;
        display: block;
        position: relative;
        left: calc(var(--ring-width) * -2);
        top: calc(var(--ring-width) * -2);
        content: ' ';
        width: var(--radius);
        height: var(--radius);
        border-radius: 50%;
        border: var(--ring-width) solid;
        border-color: var(--dark-color) transparent transparent transparent;
        animation: loading-rotate .8s ease-out infinite;
    }

    @keyframes loading-rotate {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .not-loading {
        display: none;
    }
</style>

