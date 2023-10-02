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

  export let data;
  let prompts: any[] = [];
  let initialPrompt: string | null = null;

  const selectedPrompt = writable(null);
  if (browser) {
    selectedPrompt.subscribe((value) => {
      console.log(`selected prompt: ${value}`);
      localforage.setItem(choodlePromptKey, value);
    })
  }

  onMount(() => {
    prompts = fp.shuffle(fp.map('prompt')(data.records));
    initialPrompt = prompts[0];
    rotatePrompts();
  })

  const rotatePrompts = (event?: Event) => {
    event?.preventDefault();
    const [head, ...tail] = prompts;

    if (head === initialPrompt) {
      console.log(`reached the beginning of the list again, re-shuffling prompts...`)
      prompts = fp.shuffle(prompts);
      return rotatePrompts()
    }

    selectedPrompt.set(head);
    prompts = [...tail, head];
  };

  const proceed = async () => {
    const prompt = $selectedPrompt;
    if (prompt) {
      console.log(`proceeding with prompt ${prompt}`);
      goto(`/game/cwf/draw`)
    }
  };
</script>

<main>
  {@html toHTML(data.copy.pick_promptSelectionPageTopContent)}

  <div>
    <input type="text" bind:value={$selectedPrompt} disabled/>
    <br/>
    <Button on:click={rotatePrompts}>{data.copy.pick_shuffleButtonText}</Button>
  </div>
  <div id="cta">
    <Button variant='primary' on:click={proceed}>{data.copy.pick_doneButtonText}</Button>
  </div>
</main>

<style>
  main {
    padding: 1rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    height: 100dvh;
  }

  main > * {
    flex-grow: 0 !important;
    width: 100%;
  }

  input {
    margin: 1rem 0;
    padding: 1rem;
    text-align: center;
    width: 100%;
    max-width: 20rem;
    font-size: 1.5rem;
    text-transform: uppercase;
  }

  #cta {
    width: 100%;
  }
</style>
