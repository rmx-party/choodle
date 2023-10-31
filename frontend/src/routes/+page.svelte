<script lang="ts">
  import {goto} from '$app/navigation';
  import Button from '../components/Button.svelte';
  import MetaData from '../components/MetaData.svelte';
  import Wordmark from "../components/Wordmark.svelte";
  import {toHTML} from "@portabletext/to-html";
  import star1 from "$lib/assets/star-1.png";
  import star2 from "$lib/assets/star-2.png";
  import opengraphChoodle from '$lib/assets/OpenGraph-Choodle-1200x630-2x.jpg';
  import {page} from '$app/stores';
  import {onMount} from 'svelte';
  import { choodleYellow } from '$lib/Configuration';
  import { loading } from '$lib/store';
  import { PUBLIC_ISR_BYPASS_TOKEN } from '$env/static/public'

  // export const config = {
  //   isr: {
  //     expiration: 600,
  //     bypassToken: PUBLIC_ISR_BYPASS_TOKEN
  //   }
  // }

  export let data;

  onMount(() => {
    loading.set(false)
  });
</script>


<MetaData
  title="Choodle"
  themeColor="#FEF40A"
  bgColor={choodleYellow}
  url={$page.url}
  imageUrl={opengraphChoodle}
  imageAlt="Cursive writing of the word “Choodle” with doodle stars and a smiley face on a yellow background"
  width="1200"
  height="630"
  description="Draw something that lasts forever. Express yourself with lo-fi doodles that are yours to keep, sell, or share."/>

<main id="main">
  <div id="top-box">
    <Wordmark fontSize="88px"/>
    <p class="tagline">
      <img width="22" height="17" src={star1} alt="a doodle of a star"/>
      <strong>{data.howto.tagline}</strong>
      <img width="22" height="17" src={star2} alt="a doodle of a star"/>
    </p>
  </div>

  <content id="content">
    {@html toHTML(data.howto.top)}
  </content>

  <Button variant="primary" on:click={() => {goto('/game/cwf/pick')}}>
    Play With Friends
  </Button>

  <!-- <Button variant="primary" on:click={() => {goto('/draw')}}> -->
  <!--   Draw -->
  <!-- </Button> -->

  <div id="bottom-content">
    {@html toHTML(data.howto.bottom)}
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    gap: 4rem;
    padding: 1.5rem;
    margin: 0;
    height: 100vh;
    text-align: center;
  }

  .tagline {
    margin-top: 0rem;
  }

  #bottom-content {
    color: rgba(20, 21, 24, 0.8);
  }
</style>


