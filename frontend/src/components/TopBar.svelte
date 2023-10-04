<div class="topBar">
  <slot name="topBarContent"/>
</div>

<style>
  .topBar {
    min-height: 3.1875rem;
    width: 100%;

    display: flex;
    flex-direction: row;
    padding: 0.5rem 1rem 0.75rem 1rem;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;

    border-radius: 0rem 0rem 0.75rem 0.75rem;
    background: var(--choodle-yellow, #FEF40A);
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.20);
    backdrop-filter: blur(71.56488800048828px);
  }
</style>
