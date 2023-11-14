<script lang="ts">
  import { goto, preloadData } from '$app/navigation'
  import find from 'lodash/fp/find'
  import map from 'lodash/fp/map'
  import { onMount } from 'svelte'
  import { toHTML } from '@portabletext/to-html'
  import { choodleYellow } from '$lib/Configuration'
  import { page } from '$app/stores'
  import Button from '../../../components/Button.svelte'
  import LayoutContainer from '../../../components/LayoutContainer.svelte'
  import MetaData from '../../../components/MetaData.svelte'
  import { readWriteClient } from '$lib/CMSUtils'
  import { loading } from '$lib/store'
  import { clearStorage } from '$lib/StorageStuff'
  import shuffle from 'lodash/fp/shuffle'
  import { drawPath } from '$lib/routes'

  export let data
  let prompts: string[]
  let initialPrompt: string
  let selectedPrompt: string | undefined
  $: prompts = shuffle(map('prompt')(data.records))

  onMount(async () => {
    initialPrompt = prompts[0]
    selectedPrompt = initialPrompt
    loading.set(false)

    // TODO: also if the user doesn't own this challenge, we should create a new one instead
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
      selectedPrompt = prompts.pop()
      return
    }

    console.log(`no more prompts, resetting`)
    prompts = map('prompt')(data.records)
  }

  const handleShuffle = (event: Event) => {
    event.preventDefault()

    rotatePrompts()
  }

  const proceed = async () => {
    if (!selectedPrompt) return

    console.log(`proceeding with prompt ${selectedPrompt}`)

    const gamePrompt = find((p) => p.prompt === selectedPrompt, data.records)

    if (data.challenge) {
      await readWriteClient
        .patch(data.challenge._id)
        .set({
          gamePrompt: { _ref: gamePrompt._id },
        })
        .commit()
    }

    preloadData(`/draw/${data.challenge._id}`)

    clearStorage()

    goto(drawPath(data.challenge._id))
  }
</script>

<MetaData url={$page.url} title={data.copy.defaultPageTitle} themeColor={choodleYellow} />

<LayoutContainer --layout-justify="space-evenly">
  <section class="pickPrompt">
    {@html toHTML(data.copy.pick_promptSelectionPageTopContent)}

    <output for="shuffle">{selectedPrompt}</output>
    <Button id="shuffle" colour="black" on:click={handleShuffle}
      >{data.copy.pick_shuffleButtonText}</Button
    >
  </section>

  <div id="cta">
    <Button variant="primary" online={data.challenge} on:click={proceed}
      >{data.copy.pick_doneButtonText}</Button
    >
  </div>
</LayoutContainer>

<style>
  .pickPrompt {
    display: flex;
    flex-direction: column;
    align-items: center;
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
