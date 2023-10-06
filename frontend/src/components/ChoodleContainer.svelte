
<div class="choodle-container" {...$$restProps}>
  <slot />
</div>

<style>
  .choodle-container {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin: 1rem;
    max-height: min(100%, 60svh);
    max-width: min(100%, 100svw);
  }

  .choodle-container > :global(*) {
    flex-grow: 1;
    aspect-ratio: 3/4;
    height: auto;
    width: auto;
    max-height: min(100%, 60svh);
    max-width: min(100%, 100svw);
    image-rendering: pixelated;

    border-radius: 0.22175rem;
    box-shadow: 1px 1px 17.74193572998047px 0.8870968222618103px rgba(0, 0, 0, 0.12);
  }
</style>

