<div class="frame">
  <output {...$$restProps}><slot /></output>
</div>

<style>
  .frame {
    width: 16.5625rem;
    height: 9.375rem;
    background-image: url($lib/assets/text-bubble.svg);
    background-repeat: no-repeat;
    overflow: hidden;
    padding: 0.2rem;

    display: flex;
    align-items: center;
    justify-content: center;
  }
  output {
    border-radius: 1rem;
    text-align: left;
    white-space: pre-wrap;

    color: var(--colors-brand-white, #fff);
    background-color: #0c81fd;

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

