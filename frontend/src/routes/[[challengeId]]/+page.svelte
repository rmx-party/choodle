<script lang="ts">
  import { writable } from 'svelte/store'
  import { goto } from '$app/navigation'
  import { find, map } from 'lodash/fp'
  import { onMount } from 'svelte'
  import localforage from 'localforage'
  import { choodlePromptKey } from '$lib/Configuration'
  import { toHTML } from '@portabletext/to-html'
  import { browser } from '$app/environment'
  import { choodleYellow } from '$lib/Configuration'
  import { page } from '$app/stores'
  import Button from '../../components/Button.svelte'
  import LayoutContainer from '../../components/LayoutContainer.svelte'
  import MetaData from '../../components/MetaData.svelte'
  import { readWriteClient } from '$lib/CMSUtils'
  import { loading } from '$lib/store'

  export let data
  let prompts: string[]
  let initialPrompt: string

  const selectedPrompt = writable('')
  if (browser) {
    selectedPrompt.subscribe((value) => {
      console.log(`selected prompt: ${value}`)
      localforage.setItem(choodlePromptKey, value)
    })
  }

  onMount(async () => {
    prompts = map('prompt')(data.records)
    initialPrompt = prompts[0]
    selectedPrompt.set(initialPrompt)
    loading.set(false)

    if (!data.challenge) {
      data.challenge = await readWriteClient.create(
        {
          _id: `challenge-${window.crypto.randomUUID()}`,
          _type: 'challenge',
        },
        {
          autoGenerateArrayKeys: true,
        }
      )
    }
  })

  const rotatePrompts = () => {
    console.log(prompts.length)
    if (prompts.length >= 1) {
      selectedPrompt.set(prompts.pop())
      return
    }

    prompts = map('prompt')(data.records)
  }

  const handleShuffle = (event: Event) => {
    event.preventDefault()

    rotatePrompts()
  }

  const proceed = async () => {
    const prompt = $selectedPrompt
    if (!prompt) return

    console.log(`proceeding with prompt ${prompt}`)

    const gamePrompt = find((p) => p.prompt === prompt, data.records)

    if (data.challenge) {
      await readWriteClient
        .patch(data.challenge._id)
        .set({
          gamePrompt: { _ref: gamePrompt._id },
        })
        .commit()
    }

    goto(`/draw/${data.challenge._id}`)
  }
</script>

<MetaData url={$page.url} title={data.copy.defaultPageTitle} themeColor={choodleYellow} />

<LayoutContainer --layout-justify="space-evenly">
  <section class="pickPrompt">
    {@html toHTML(data.copy.pick_promptSelectionPageTopContent)}

    <output for="shuffle">{$selectedPrompt}</output>
    <br />
    <Button id="shuffle" colour="black" on:click={handleShuffle}
      >{data.copy.pick_shuffleButtonText}</Button
    >
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
