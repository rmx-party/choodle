
<menu class="buttons" {...$$restProps}>
  <slot />
</menu>

<style>
  .buttons {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    flex-direction: row;
    align-content: center;
    gap: 1rem;
    padding: 0 0 1rem;
    margin: 0;
  }
  .buttons :global(.btn) {
    max-width: 200px;
    padding: 0.5rem;
  }
</style>
