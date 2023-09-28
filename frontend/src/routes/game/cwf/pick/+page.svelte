<script lang="ts">
  import { writable } from 'svelte/store';
  import Button from '../../../../components/Button.svelte';
  import { goto } from '$app/navigation';
  import fp from 'lodash/fp';
  import { onMount } from 'svelte';
  import localforage from 'localforage';
  import { choodlePromptKey } from '$lib/Configuration';
  import {toHTML} from "@portabletext/to-html";

  export let data;

  const selectedPrompt = writable(null);
  selectedPrompt.subscribe((value) => {
    localforage.setItem(choodlePromptKey, value);
  })

  onMount(() => {
    shufflePrompts(new MouseEvent('click'));
  })

  const shufflePrompts = (event: MouseEvent, tries = 0) => {
    if (tries > 10) {
      console.error(`shufflePrompts: too many tries, maybe there aren't any other prompts`);
      return;
    }

    const prompts = fp.map('prompt')(data.records);
    const newPrompt = (prompts.sort(() => Math.random() - 0.5))[0];

    if (newPrompt !== $selectedPrompt) {
      selectedPrompt.set(newPrompt);
      console.log(`selected prompt: ${newPrompt}`);
    } else {
      shufflePrompts(event, tries + 1)
    }
  };

  const proceed = () => {
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
    <input type="text" bind:value={$selectedPrompt} disabled />
    <br/>
    <Button on:click={shufflePrompts}>{data.copy.pick_shuffleButtonText}</Button>
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
