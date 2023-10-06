<script lang="ts">
  import {urlFor} from "$lib/PersistedImagesUtils"
  import {page} from "$app/stores";
  import Button from "../../../components/Button.svelte";
  import handDraw from "$lib/assets/hand-draw.svg"
  import send from "$lib/assets/send.svg"
  import MetaData from "../../../components/MetaData.svelte";
  import {goto} from "$app/navigation";
  import {clearStorage} from "$lib/StorageStuff";
  import {toHTML} from "@portabletext/to-html";
  import Wordmark from "../../../components/Wordmark.svelte";
  import {onMount} from "svelte";
  import {browser} from "$app/environment";
  import ChoodleContainer from "../../../components/ChoodleContainer.svelte";

  export let data = {};
  let imgBlob;

  const canShare = (): boolean => {
    console.log('canshare')
    console.log(imgBlob)
    if (!browser) return false;
    if (!navigator.share) return false;
    return navigator.canShare(generateShareableFor(imgBlob))
  }

  function generateFilesFor(imgBlob: Blob) {
    return [
      new File(
        [imgBlob],
        'c.png',
        {
          type: 'image/png',
          lastModified: Date.now()
        }
      )
    ];
  }

  onMount(async () => {
    const img: unknown = urlFor(data.choodle.upScaledImage);
    imgBlob = await (await fetch(img as URL)).blob();
  })

  function generateShareableFor() {
    return {
      title: 'Choodle',
      url: $page.url
    };
  }

  const share = async (event: Event) => {
    if (!browser) return;
    event.preventDefault()
    // const files = generateFilesFor(imgBlob);
    console.log('page url: ', $page.url)
    if (navigator.share) {
      navigator.share(generateShareableFor()).then(() => {
        console.log('Thanks for sharing!');
      }).catch(console.error);
    } else {
      console.error('Web Share API not supported')
    }
  };

  const clearAndStartOver = async () => {
    clearStorage()
    await goto("/draw")
  }

  const topContent = () => {
    if (data.copy?.tagline) {
      return toHTML(data.copy.tagline)
    }
    return ''
  }

  const bottomContent = () => {
    if (data.copy?.bottom) {
      return toHTML(data.copy.bottom)
    }
    return ''
  }

  const resetViewportUnit = async () => {
    if (!browser) return;
    // https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  onMount(() => {
    let root = document.documentElement;
    root.style.setProperty('--page-background-color', 'var(--choodle-yellow)');

    setTimeout(async () => {
      await resetViewportUnit()
    }, 20);
  })
</script>

<MetaData url={$page.url}
  title="Look, it's a Choodle"
  imageUrl={urlFor(data.choodle.upScaledImage)}
  width="430"
  height="932"
/>

<div class="container">
  <div id="top-box">
    <a href="/">
      <Wordmark fontSize="4.25rem"/>
    </a>
    <span class="tagline">
      {@html topContent()}
    </span>
  </div>

  <ChoodleContainer>
    <img src={urlFor(data.choodle.upScaledImage)} width='390' height='520' alt=''/>
  </ChoodleContainer>

  <section class="content">
    {@html bottomContent()}
  </section>

  <menu>
    <Button on:click={clearAndStartOver} icon={handDraw}>New</Button>
    {#if canShare()}
      <Button on:click={share} icon={send} iconPosition='right'>Share</Button>
    {/if}
  </menu>
</div>

<style>
  :root {
    text-align: center;
  }

  .container {
    /* gap: 2rem; */
    padding: 1rem 1rem;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-content: stretch;
    align-items: stretch;
    justify-content: space-between;
    height: 100vh;
    height: calc(var(--vh, 1vh) * 100); /* https://css-tricks.com/the-trick-to-viewport-units-on-mobile/ */
    width: 100%;
    padding: 1.5rem;
  }

  menu {
    display: flex;
    flex-direction: row;
    margin: 1rem 0;
    padding: 0;
    gap: 1rem;
  }

  .tagline {
    margin-top: 0rem;
  }
</style>
