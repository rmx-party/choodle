<div class="topBar-layout" {...$$restProps}>
  <slot name="topBarContent" />
</div>

<style>
  .topBar-layout {
    width: 100%;

    display: flex;
    flex-direction: row;
    padding: 0.5rem 1rem;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
  }
</style>
