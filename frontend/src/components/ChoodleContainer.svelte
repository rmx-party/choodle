<div class="choodle-container" {...$$restProps}>
  <slot />
</div>

<style>
  .choodle-container,
  .choodle-container > :global(*) {
    flex-grow: 1;
    aspect-ratio: 3/4;

    max-height: clamp(100px, 100%, calc(100svh - var(--choodle-max-height-offset, 60svh)));
    max-width: min(100%, 100svw);
  }

  .choodle-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin: 0.5rem;
  }

  .choodle-container > :global(*) {
    image-rendering: pixelated;
    border-radius: 0.22175rem;
    box-shadow: 1px 1px 17.74193572998047px 0.8870968222618103px rgba(0, 0, 0, 0.12);
  }
</style>
