<script lang="ts">
  import { browser } from '$app/environment'
  import { goto, preloadData } from '$app/navigation'
  import find from 'lodash/fp/find'
  import map from 'lodash/fp/map'
  import { getContext, onMount } from 'svelte'
  import { toHTML } from '@portabletext/to-html'
  import { page } from '$app/stores'
  import Button from '../../components/Button.svelte'
  import LayoutContainer from '../../components/LayoutContainer.svelte'
  import MetaData from '../../components/MetaData.svelte'
  import { loading, uncaughtErrors } from '$lib/store'
  import { clearStorage } from '$lib/StorageStuff'
  import shuffle from 'lodash/fp/shuffle'
  import { drawPath } from '$lib/routes'
  import type { PageData } from './$types'
  import { createChallenge, updateChallenge } from '$lib/storage'
  import type { Writable } from 'svelte/store'
  import type { User } from '@prisma/client'

  export let data: PageData
  const currentChoodler: Writable<User> = getContext('choodler')

  let prompts: string[]
  let initialPrompt: string
  let selectedPrompt: string | undefined
  $: prompts = shuffle(map('prompt')(data.records))
  let selectedPromptSanityId: string | undefined
  $: {
    selectedPrompt &&
      (selectedPromptSanityId = find((r) => r.prompt == selectedPrompt, data.records)._id) &&
      console.log({ selectedPromptSanityId })
  }
  $: {
    if (
      (!data.challenge && selectedPromptSanityId) ||
      data.challenge?.userId !== $currentChoodler?.id
    ) {
      initializeChallenge()
    }
  }

  const initializeChallenge = async () => {
    if (!$currentChoodler?.id) return
    if (!selectedPromptSanityId || !selectedPrompt) return
    if (data.challenge?.userId == $currentChoodler?.id) return

    $loading || loading.set(true)
    console.log(`creating new challenge`, {
      prompt: selectedPrompt,
      promptSanityId: selectedPromptSanityId,
      userId: $currentChoodler.id,
      challengeId: data.challenge?.id,
    })

    createChallenge({
      prompt: selectedPrompt,
      promptSanityId: selectedPromptSanityId,
    })
      .then((newChallenge) => {
        console.log(`created new challenge, going to it`)
        data.challenge = newChallenge
        goto(`/${newChallenge.id}`)
        loading.set(false)
      })
      .catch((err) => {
        console.error(err)
        uncaughtErrors.set([...$uncaughtErrors, err])
      })
  }

  onMount(async () => {
    initialPrompt = prompts[0]
    selectedPrompt = initialPrompt
    loading.set(false)
  })

  const rotatePrompts = () => {
    console.log(prompts.length, 'prompts left')
    if (prompts.length >= 1) {
      selectedPrompt = prompts.pop()
      return
    }

    console.log(`no more prompts, resetting`)
    prompts = map('prompt')(data.records)
  }

  const handleShuffle = (event: Event) => {
    if (!browser) return
    event.preventDefault()

    rotatePrompts()

    // add GA event for skipped prompt
    window?.gtag?.('event', 'skip_prompt', {
      event_category: 'engagement',
      event_label: selectedPrompt,
    })
  }

  const proceed = async () => {
    if (!selectedPrompt) return
    if (!data.challenge?.id) return

    console.log(`proceeding with prompt ${selectedPrompt}`)

    loading.set(true)

    await updateChallenge({
      id: data.challenge.id,
      prompt: selectedPrompt,
      promptSanityId: selectedPromptSanityId,
    }).then((result) => {
      preloadData(drawPath(result.id))
    })
    // await readWriteClient
    //   .patch(data.challenge._id)
    //   .set({
    //     gamePrompt: { _ref: gamePrompt._id },
    //   })
    //   .commit()

    clearStorage()

    // add GA event for selected prompt
    browser &&
      window?.gtag?.('event', 'select_prompt', {
        event_category: 'engagement',
        event_label: selectedPrompt,
      })

    goto(drawPath(data.challenge.id))
  }
</script>

<MetaData
  url={$page.url}
  title={data.pageContent.pageTitle}
  description={data.pageContent.pageDescription}
/>

<LayoutContainer --layout-justify="space-evenly">
  <section class="pickPrompt block-content">
    {@html toHTML(data.copy.pick_promptSelectionPageTopContent)}

    <output for="shuffle">{selectedPrompt}</output>
    <Button id="shuffle" colour="black" on:click={handleShuffle}
      >{data.copy.pick_shuffleButtonText}</Button
    >
  </section>

  <div id="cta">
    <Button variant="primary" online={data.challenge} on:click={proceed} offline={!data.challenge}
      >{data.copy.pick_doneButtonText}</Button
    >
  </div>
  <section class="content">
    {@html toHTML(data.copy.landing_content_bottom)}
  </section>
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
