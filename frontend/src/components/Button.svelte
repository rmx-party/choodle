<script lang="ts">
    export let variant = 'secondary';
    export let isOnline = true;
</script>

{#if isOnline}
    <div class={`btn ${variant}`} on:click>
        <slot/>
    </div>
{:else}
    <div class={`btn ${variant} disabled`}>
        <slot/>
    </div>
{/if}

<style>
    .btn {
        flex-grow: 1;
        flex-shrink: 0;
        height: 3.5em;
        padding: 0.5rem;
        box-shadow: 0px 4px 24px 0px rgba(0, 0, 0, 0.01), 0px -2px 8px 0px rgba(0, 0, 0, 0.12) inset, 0px 2px 24px 0px rgba(255, 255, 255, 0.40) inset, 0px 1px 4px 0px rgba(0, 0, 0, 0.04);

        border-radius: 1.5rem;
        backdrop-filter: blur(80px);
        justify-content: center;
        align-items: center;
        display: inline-flex;
        color: #141518;
        font-size: 18px;
        font-family: var(--app-main-font-family);
        font-weight: 400;
        line-height: 21.60px;
        letter-spacing: 0.18px;
        word-wrap: break-word;
        text-decoration: none;
    }

    .secondary {
        background: white;
        border: 0.50px white solid;
        gap: 1rem;
    }

    .disabled {
        color: grey;
    }

    .primary {
        background: var(--color-primary);
        border: 0.50px #FFF506 solid;
        gap: 0.5rem;
        font-weight: 700;
    }

    .big {
        width: 100%;
        margin: 1rem auto;

        height: 6.5rem;
        gap: 0.5rem;
        border-radius: 4rem;

        font-size: 1.5rem;
        font-style: normal;
        font-weight: 700;
        line-height: 120%; /* 1.8rem */
    }
</style>
