<div class="frame">
  <output {...$$restProps}><slot /></output>
</div>

<style>
  .frame {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16.5625rem;
    height: 9.375rem;
    background-image: url($lib/assets/text-bubble.svg);
    background-repeat: no-repeat;
    overflow: hidden;
    padding: 0.5rem;
  }
  output {
    color: var(--colors-brand-white, #fff);
    padding: 1rem;
    border-radius: 1rem;
    background-color: #0c81fd;
    white-space: pre-wrap;
    text-align: left;

    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      'Open Sans',
      'Helvetica Neue',
      Arial,
      sans-serif;
    font-size: 0.9375rem;
    font-style: normal;
    font-weight: 400;
    line-height: 100%; /* 0.9375rem */
    letter-spacing: 0.00938rem;
  }
</style>

