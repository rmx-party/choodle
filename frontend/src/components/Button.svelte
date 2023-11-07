<script lang="ts">
  export let variant = 'secondary';
  export let isOnline = true;
  export let icon: string | undefined = undefined;
  export let iconPosition: 'left' | 'right' = 'left';

  export let colour: 'yellow' | 'white' | 'black' = 'white';
</script>

{#if isOnline}
  <button class={`btn ${variant} ${colour}`} on:click {...$$restProps}>
    {#if icon && iconPosition == 'left'}
      <img class="icon" src={icon} alt=""/>
    {/if}
    <slot/>
    {#if icon && iconPosition == 'right'}
      <img class="icon" src={icon} alt=""/>
    {/if}
  </button>
{:else}
  <button disabled class={`btn ${variant}  ${colour} disabled`} {...$$restProps}>
    {#if icon && iconPosition == 'left'}
      <img class="icon" src={icon} alt=""/>
    {/if}
    <slot/>
    {#if icon && iconPosition == 'right'}
      <img class="icon" src={icon} alt=""/>
    {/if}
  </button>
{/if}

<style>
  .btn {
    flex-grow: 1;
    flex-shrink: 0;
    height: 3.5em;
    border-radius: 1.5rem;
    justify-content: center;
    align-items: center;
    display: inline-flex;
    padding: 0.5rem 3.5rem;
    margin: 0.25rem auto;
    border: none;

    backdrop-filter: blur(40px);
    background: #fff;
    box-shadow: 0px 4px 24px 0px rgba(0, 0, 0, 0.01),
    0px -2px 8px 0px rgba(0, 0, 0, 0.12) inset,
    0px 2px 24px 0px rgba(255, 255, 255, 0.4) inset,
    0px 1px 4px 0px rgba(0, 0, 0, 0.04);
    backdrop-filter: blur(40px);

    color: var(--choodle-black);
    font-size: 18px;
    font-family: var(--app-main-font-family);
    font-weight: 400;
    line-height: 21.6px;
    letter-spacing: 0.18px;
    word-wrap: break-word;
    text-decoration: none;
  }

  .white {
    background: rgba(255, 255, 255, 0.98);
    color: var(--choodle-black);
  }

  .yellow {
    background: var(--choodle-yellow);
    color: var(--choodle-black);
  }

  .black {
    color: var(--colors-brand-white, #FFF);
    border: 1px solid var(--choodle-yellow, #FEF40A);
    background: var(--choodle-black, #141518);
    box-shadow: 2px 2px 4px 0px #000 inset;
  }

  .secondary {
    gap: 1rem;

    /* mobile/button-secondary */
    font-family: DejaVu Sans;
    font-size: 1.125rem;
    font-style: normal;
    font-weight: 400;
    line-height: 120%; /* 1.35rem */
    letter-spacing: 0.01125rem;
  }

  .btn.hover,
  .btn:hover,
  .btn.press,
  .btn:active,
  .btn.focus,
  .btn:focus {
    box-shadow: -1px -1px 1px 0px rgba(20, 21, 24, 0.09) inset,
    2px 2px 4px 0px rgba(20, 21, 24, 0.16) inset;
  }

  .primary {
    flex-grow: 0;
    max-width: 21rem;
    margin: 1rem auto;
    padding: 1rem 1.5rem;

    display: flex;
    justify-content: center;
    align-items: center;
    height: 6.5rem;
    gap: 0.5rem;

    border-radius: 4rem;

    font-family: DejaVu Sans Bold;
    font-size: 1.5rem;
    font-style: normal;
    font-weight: 700;
    line-height: 120%; /* 1.8rem */

    backdrop-filter: blur(40px);
    box-shadow: 0px 4px 24px 0px rgba(20, 21, 24, 0.1),
    0px -2px 8px 0px rgba(20, 21, 24, 0.18) inset,
    0px 2px 24px 0px rgba(255, 255, 255, 0.4) inset,
    0px 1px 2px 0px rgba(20, 21, 24, 0.17);
  }

  .primary.hover,
  .primary:hover,
  .primary.press,
  .primary:active,
  .primary.focus,
  .primary:focus {
    box-shadow: -1px -1px 1px 0px rgba(20, 21, 24, 0.09) inset,
    2px 2px 4px 0px rgba(20, 21, 24, 0.16) inset;
  }

  .disabled {
    color: #bfbfbf;
    background: none;
    box-shadow: none;
    border: none;
  }

  .primary.disabled {
    color: #c0c0c0;
    background: none;
    box-shadow: none;
    border: none;
  }

  .btn.disabled::after {
    content: '';
    backdrop-filter: contrast(0.05);
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;
    image-rendering: pixelated;
  }

  .primary .icon {
    width: 2.5rem;
    height: 2.5rem;
    image-rendering: pixelated;
  }
</style>
