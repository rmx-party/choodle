<script lang="ts">
  import { browser } from '$app/environment';
  import { onDestroy } from 'svelte';

  const newEllipsesFrom = (oldEllipses) => {
    switch (oldEllipses) {
      case '':
        return '.';
      case '.':
        return '..';
      case '..':
        return '...';
      case '...':
        return '';
    }
  };

  const updateEllipses = async () => {
    if (!browser) return;
    const ellipses = document.getElementsByClassName('ellipses')[0];
    if (!ellipses) return;
    ellipses.innerHTML = newEllipsesFrom(ellipses.innerHTML);
  };

  const intervalId = setInterval(updateEllipses, 300);

  onDestroy(() => {
    console.log('clearing the interval');
    clearInterval(intervalId);
  });
</script>

<span class="ellipses"></span>

<style>
  .ellipses {
    display: inline-block;
    width: 1em;
  }
</style>
