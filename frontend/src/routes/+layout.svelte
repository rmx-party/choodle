<script lang="ts">
  import { browser, dev } from '$app/environment';
  import { isOnline } from '$lib/store';
  import { webVitals } from '$lib/vitals';
  import '$lib/assets/fonts.css';
  import { onMount } from 'svelte';
  import '../app.css';
  import LoadingIndicator from '../components/LoadingIndicator.svelte';
  import Bugsnag from '@bugsnag/js';
  import { page } from '$app/stores';
  import fp from 'lodash/fp';
  import { preloadCode } from '$app/navigation';

  export let data;

  console.log('analytics ID', data.analyticsId);
  $: if (browser && data.analyticsId) {
    webVitals({
      path: $page.url.pathname,
      params: $page.params,
      analyticsId: data.analyticsId,
    });
  }

  if (browser && !dev) {
    Bugsnag.start({ apiKey: '91931cee1cbae5feec1925a566386158' });
  }

  const rotatingMessages = fp.filter(
    (msg) => msg,
    [
      data.copy?.loadingMessage1,
      data.copy?.loadingMessage2,
      data.copy?.loadingMessage3,
      data.copy?.loadingMessage4,
      data.copy?.loadingMessage5,
    ]
  );

  onMount(async () => {
    window.addEventListener('online', () => {
      console.log('online');
      isOnline.set(true);
    });
    window.addEventListener('offline', () => {
      console.log('offline');
      isOnline.set(false);
    });

    preloadCode('/game/cwf/pick', '/game/cwf/draw', '/game/cwf/share/*', '/game/cwf/guess/*');
  });
</script>

<LoadingIndicator {rotatingMessages} />
<slot />
