<script lang="ts">
  export let Component;
</script>

<svelte:component this={Component} {...$$restProps}>
  <h1 data-testid="slot">Test Data</h1>
</svelte:component>
