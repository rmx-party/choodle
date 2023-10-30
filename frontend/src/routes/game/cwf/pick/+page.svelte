<script lang="ts">
  import {writable} from 'svelte/store';
  import Button from '../../../../components/Button.svelte';
  import {goto} from '$app/navigation';
  import fp from 'lodash/fp';
  import {onMount} from 'svelte';
  import localforage from 'localforage';
  import {choodlePromptKey} from '$lib/Configuration';
  import {toHTML} from "@portabletext/to-html";
  import {browser} from "$app/environment";
  import LayoutContainer from '../../../../components/LayoutContainer.svelte';
  import {choodleYellow} from '$lib/Configuration';
  import {page} from '$app/stores';
  import MetaData from '../../../../components/MetaData.svelte';
  import {urlFor} from '$lib/PersistedImagesUtils';

  export let data;
  let prompts: string[]
  let initialPrompt: string

  const selectedPrompt = writable('');
  if (browser) {
    selectedPrompt.subscribe((value) => {
      console.log(`selected prompt: ${value}`);
      localforage.setItem(choodlePromptKey, value);
    })
  }

  onMount(() => {
    prompts = fp.map('prompt')(data.records)
    initialPrompt = prompts[0]
    selectedPrompt.set(initialPrompt)
  })

  const rotatePrompts = () => {
    console.log(prompts.length)
    if (prompts.length >= 1) {
      selectedPrompt.set(prompts.pop())
      return
    }

    prompts = fp.map('prompt')(data.records)
  }

  const handleShuffle = (event: Event) => {
    event.preventDefault()

    rotatePrompts()
  }

  const proceed = async () => {
    const prompt = $selectedPrompt;
    if (prompt) {
      console.log(`proceeding with prompt ${prompt}`);
      goto(`/game/cwf/draw`)
    }
  };
</script>

<MetaData
  url={$page.url}
  title="Choodle with Friends"
  themeColor={choodleYellow}
/>

<LayoutContainer --layout-justify="space-evenly">
  <section class="pickPrompt">
    {#if data.copy.logo}<img src={urlFor(data.copy.logo).url()}/>{/if}
    {@html toHTML(data.copy.pick_promptSelectionPageTopContent)}

    <output for="shuffle">{$selectedPrompt}</output>
    <br/>
    <Button id="shuffle" on:click={handleShuffle}>{data.copy.pick_shuffleButtonText}</Button>
  </section>

  <div id="cta">
    <Button variant='primary' on:click={proceed}>{data.copy.pick_doneButtonText}</Button>
  </div>
</LayoutContainer>

<style>
  .pickPrompt {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .pickPrompt img {
    max-width: 100%;
  }

  output {
    display: flex;
    padding: 1rem 0.5rem;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    text-align: center;

    margin: 1rem 0;
    width: 100%;
    max-width: 15rem;

    font-size: 1.5rem;
    text-transform: uppercase;
    color: var(--choodle-black);

    border-radius: 0.25rem;
    border: 1px solid var(--choodle-black, #141518);
    background: var(--colors-greyscale-1, #FCFCFC);
  }

  #cta {
    width: 100%;
  }
</style>
