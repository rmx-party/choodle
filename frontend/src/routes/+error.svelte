<script>
  import Button from '../components/Button.svelte'

  import Wordmark from '../components/Wordmark.svelte'
  import { goto } from '$app/navigation'
  import MetaData from '../components/MetaData.svelte'
  import { onMount } from 'svelte'
  import { loading } from '$lib/store'
  import { dashboardPath } from '$lib/routes'
  import { pageBackgroundDefault } from '$lib/Configuration'

  onMount(() => {
    loading.set(false)
  })
</script>

<MetaData title="Oops!" themeColor={pageBackgroundDefault} />

<div class="container">
  <div id="top-box">
    <h1>Oops!</h1>
    <p>Something got lost on our end. <br />Retry again soon.</p>
  </div>

  <img
    class="error-image"
    height="263"
    width="174"
    src="/choodle-bob-p2.png"
    alt="A doodle of the painter Bob Ross, slightly smiling"
  />

  <Button variant="big primary yellow" on:click={() => goto(dashboardPath())}>Back Home</Button>

  <p><strong>Having trouble?</strong> <a href="mailto:help@choodle.xyz">Email us</a></p>

  <footer>
    <Wordmark />
    © 2023
  </footer>
</div>

<style>
  .container {
    color: var(--choodle-black, #141518);
    text-align: center;
    line-height: 120%; /* 1.35rem */
    background: white;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    flex-direction: column;
    flex-wrap: nowrap;
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  img {
    margin-top: 2rem;
    margin-bottom: 1.5rem;
    object-fit: contain;
    image-rendering: pixelated;
  }

  footer {
    flex-grow: 1;
    margin: 0 auto;
    width: 100%;
    text-align: center;

    color: #000;
    font-size: 0.875rem;
    font-style: normal;
    font-weight: 400;
    line-height: 120%; /* 1.05rem */
  }

  :global(.btn.primary) {
    width: 100%;
  }
</style>
