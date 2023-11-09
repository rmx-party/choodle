<div class="topBar-layout" {...$$restProps}>
  <slot name="topBarContent" />
</div>

<style>
  .topBar-layout {
    width: 100%;

    display: flex;
    flex-direction: row;
    padding: 1rem 1rem 0.5rem;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
  }
</style>
