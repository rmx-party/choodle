<div id="layoutContainer" {...$$restProps}>
  <slot name="topBar" />
  <div id="flexLayout">
    <slot />
  </div>
</div>

<style>
  #layoutContainer {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    text-align: center;
    padding: 0;
    margin: 0 auto;

    width: 100%;
    height: clamp(500px, 100svh, 900px);
  }

  #flexLayout {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    text-align: center;
    margin: 0;

    padding: 0 1rem;
    width: 100%;
    height: 100%;
    max-width: 500px;

    justify-content: var(--layout-justify, flex-start);
  }

  .no-pan {
    touch-action: pan-x pan-y;
    touch-action: none;
  }
</style>
