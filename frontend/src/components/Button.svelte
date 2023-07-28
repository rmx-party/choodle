<script lang="ts">
    export let variant = 'secondary';
    export let isOnline = true;
    export let icon: string | undefined;
</script>

{#if isOnline}
    <div class={`btn ${variant}`} on:click>
        {#if icon}
            <img class="icon" src={icon} alt='' />
        {/if}
        <slot/>
    </div>
{:else}
    <div class={`btn ${variant} disabled`}>
        {#if icon}
            <img class="icon" src={icon} alt='' />
        {/if}
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

        color: var(--choodle-black);
        /* mobile/button-secondary */
        font-family: DejaVu Sans;
        font-size: 1.125rem;
        font-style: normal;
        font-weight: 400;
        line-height: 120%; /* 1.35rem */
        letter-spacing: 0.01125rem;
    }

    .primary {
        color: var(--choodle-black);
        /* mobile/button-primary */
        font-family: DejaVu Sans Bold;
        font-size: 1.5rem;
        font-style: normal;
        font-weight: 700;
        line-height: 120%; /* 1.8rem */

        width: 100%;
        margin: 1rem auto;

        display: flex;
        padding: 0.5rem;
        justify-content: center;
        align-items: center;
        height: 6.5rem;
        gap: 0.5rem;

        border-radius: 4rem;
        border: 1px solid #FFF506;
        background: var(--choodle-yellow, #FEF40A);

        /* button/action */
        box-shadow: 0px 4px 24px 0px rgba(0, 0, 0, 0.01), 0px -2px 8px 0px rgba(0, 0, 0, 0.12) inset, 0px 2px 24px 0px rgba(255, 255, 255, 0.40) inset, 0px 1px 4px 0px rgba(0, 0, 0, 0.04);
        backdrop-filter: blur(40px);
    }

    .primary.hover,
    .primary:hover,
    .primary.press,
    .primary:active,
    .primary.focus,
    .primary:focus {
        border: 1px solid #FFF506;
        background: linear-gradient(0deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.02) 100%), #FEF40A;

        /* button/pressed */
        box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.12) inset, 1px 1px 2px 0px rgba(0, 0, 0, 0.12) inset;
    }

    .disabled {
        color: #BFBFBF;
        border-radius: 1.5rem;

        /* button/pressed */
        box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.12) inset, 1px 1px 2px 0px rgba(0, 0, 0, 0.12) inset;
    }
    .primary.disabled {
        color: #C0C0C0;
        background: none;
        box-shadow: none;
        border: none;
    }
    .primary.disabled::after {
        content: '';
        backdrop-filter: contrast(0.05);
        display:block;
        position: absolute;
        width: 100%;
        height: 100%;
    }


    .icon {
        width: 2.5rem;
        height: 2.5rem;
        image-rendering: pixelated;
    }
</style>
