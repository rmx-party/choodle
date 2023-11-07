<div class="topBar-layout" {...$$restProps}>
  <slot name="topBarContent"/>
</div>

<style>
  .topBar-layout {
    min-height: 3.1875rem;
    width: 100%;

    display: flex;
    flex-direction: row;
    padding: 0.5rem 1rem 0.75rem 1rem;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
  }
</style>
