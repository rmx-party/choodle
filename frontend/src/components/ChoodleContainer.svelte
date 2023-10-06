
<div class="choodle-container" {...$$restProps}>
  <slot class="choodle" name="choodle" />
</div>

<style>
  .choodle-container {
    flex-grow: 1;
    display: flex;
    align-items: center;
    padding: 0;
    flex-grow: 1;
    max-width: 100%;
    aspect-ratio: 3/4;
  }

  .choodle-container > :global(*) {
    flex-grow: 1;
    max-height: 100%;
    max-width: 100%;
    aspect-ratio: 3/4;
    image-rendering: pixelated;

    border-radius: 0.22175rem;
    box-shadow: 1px 1px 17.74193572998047px 0.8870968222618103px rgba(0, 0, 0, 0.12);
  }
</style>

