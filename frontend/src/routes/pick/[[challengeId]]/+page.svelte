<script lang="ts">
  import {writable} from 'svelte/store';
  import {goto} from '$app/navigation';
  import fp from 'lodash/fp';
  import {onMount} from 'svelte';
  import localforage from 'localforage';
  import {choodlePromptKey} from '$lib/Configuration';
  import {toHTML} from '@portabletext/to-html';
  import {browser} from '$app/environment';
  import {choodleYellow} from '$lib/Configuration';
  import {page} from '$app/stores';
  import {urlFor} from '$lib/PersistedImagesUtils';
  import Button from '../../../components/Button.svelte';
  import LayoutContainer from '../../../components/LayoutContainer.svelte';
  import MetaData from '../../../components/MetaData.svelte';
  import {readWriteClient} from '$lib/CMSUtils';
  import {loading} from '$lib/store';

  export let data;
  let prompts: string[];
  let initialPrompt: string;
  let challengeId: string | null = null;
  $: challengeId = $page.params.challengeId;

  const selectedPrompt = writable('');
  if (browser) {
    selectedPrompt.subscribe((value) => {
      console.log(`selected prompt: ${value}`);
      localforage.setItem(choodlePromptKey, value);
    });
  }

  onMount(() => {
    prompts = fp.map('prompt')(data.records);
    initialPrompt = prompts[0];
    selectedPrompt.set(initialPrompt);
    loading.set(false);
  });

  const rotatePrompts = () => {
    console.log(prompts.length);
    if (prompts.length >= 1) {
      selectedPrompt.set(prompts.pop());
      return;
    }

    prompts = fp.map('prompt')(data.records);
  };

  const handleShuffle = (event: Event) => {
    event.preventDefault();

    rotatePrompts();
  };

  const proceed = async () => {
    const prompt = $selectedPrompt;
    if (!prompt) return;

    console.log(`proceeding with prompt ${prompt}`);

    const gamePrompt = fp.find((p) => p.prompt === prompt, data.records);

    if ($page.params.challengeId) {
      await readWriteClient
        .patch(challengeId)
        .set({
          gamePrompt: gamePrompt.prompt,
          gamePromptRef: {_ref: gamePrompt._id},
        })
        .commit();
    }

    if (!challengeId) {
      challengeId = '';
    }
    goto(`/game/cwf/draw/${challengeId}`);
  };
</script>

<MetaData url={$page.url} title={data.copy.defaultPageTitle} themeColor={choodleYellow}/>

<LayoutContainer --layout-justify="space-evenly">
  <section class="pickPrompt">
    {#if data.copy.logo}<img src={urlFor(data.copy.logo).url()}/>{/if}
    {@html toHTML(data.copy.pick_promptSelectionPageTopContent)}

    <output for="shuffle">{$selectedPrompt}</output>
    <br/>
    <Button id="shuffle" on:click={handleShuffle}>{data.copy.pick_shuffleButtonText}</Button>
  </section>

  <div id="cta">
    <Button variant="primary" on:click={proceed}>{data.copy.pick_doneButtonText}</Button>
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
    background: var(--colors-greyscale-1, #fcfcfc);
  }

  #cta {
    width: 100%;
  }
</style>
