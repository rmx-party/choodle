<script lang="ts">
  import { browser } from '$app/environment'
  import { goto, invalidate, preloadData } from '$app/navigation'
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
  import CategorySelect from '../../components/CategorySelect.svelte'
  import uniq from 'lodash/fp/uniq'
  import compact from 'lodash/fp/compact'
  import flow from 'lodash/fp/flow'
  import filter from 'lodash/fp/filter'
  import uniqBy from 'lodash/fp/uniqBy'
  import type { SanityDocument } from '@sanity/client'

  type PromptCategory = SanityDocument & {
    label: string
  }

  export let data: PageData
  const currentChoodler: Writable<User> = getContext('choodler')

  let mounted = false
  let prompts: string[]
  let selectedPrompt: string | undefined
  let selectedPromptSanityId: string | undefined
  let selectableCategories: PromptCategory[] = []
  let selectedCategory: PromptCategory | undefined = undefined

  $: console.log({ selectableCategories })
  $: console.log({ selectedCategory })
  $: console.log({ prompts })
  $: console.log({ selectedPrompt })

  $: selectableCategories = flow(map('category'), uniqBy('_id'), compact)(data.gamePrompts)
  $: selectedCategory?._id && (prompts = resetActivePrompts(data.gamePrompts, selectedCategory))
  $: {
    if (
      (!data.challenge && selectedPromptSanityId) ||
      data.challenge?.userId !== $currentChoodler?.id
    ) {
      initializeChallenge()
    }
  }

  const resetActivePrompts = (gamePrompts: SanityDocument[], category: SanityDocument) => {
    return flow(
      compact,
      filter((r: PromptCategory) => r.category?._id === category?._id),
      map('prompt'),
      uniq,
      shuffle
    )(gamePrompts)
  }

  const initializeChallenge = async () => {
    if (!$currentChoodler?.id) return
    if (!selectedPromptSanityId || !selectedPrompt) return
    if (data.challenge?.userId == $currentChoodler?.id) return

    // TODO: don't create another empty challenge if user already has an empty one to fill

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
      .then(async (newChallenge) => {
        console.log(`created new challenge, going to it`)
        await goto(`/${newChallenge.id}`)
        loading.set(false)
        preloadData(drawPath(newChallenge.id))
      })
      .catch((err) => {
        console.error(err)
        uncaughtErrors.set([...$uncaughtErrors, err])
      })
  }

  onMount(async () => {
    if (data.challenge?.promptSanityId) {
      console.log(`challenge has a prompt sanity id`, data.challenge?.promptSanityId)
      const savedCategory = find(
        (r) => r._id == data.challenge?.promptSanityId,
        data.gamePrompts
      ).category
      console.log(`saved prompt category`, savedCategory)
      selectedCategory = find((r) => r._id == savedCategory._id, selectableCategories)
      selectedPrompt = data.challenge.prompt
      console.log(`selected initial prompt`, selectedPrompt)
    }
    selectedCategory ||= selectableCategories[0]
    console.log(`selected initial category`, selectedCategory)

    mounted = true
    loading.set(false)
  })

  const rotatePrompts = () => {
    console.log(prompts.length, 'prompts left')
    if (prompts.length >= 1) {
      selectedPrompt = prompts.pop()
      return
    }

    console.log(`no more prompts, resetting`)
    prompts = map('prompt')(data.gamePrompts)
  }

  const handleShuffle = (event: Event) => {
    if (!browser) return
    event.preventDefault()

    // add GA event for skipped prompt
    window?.gtag?.('event', 'skip_prompt', {
      event_category: 'engagement',
      event_label: selectedPrompt,
    })

    rotatePrompts()
  }

  const updateChallengePrompt = async (prompt: string) => {
    const id = data.challenge?.id
    if (!id) return

    console.log(`updating challenge prompt to ${prompt}`)
    await updateChallenge({
      id,
      prompt,
      promptSanityId: selectedPromptSanityId,
    })
    invalidate(drawPath(id))
  }

  const proceed = async () => {
    if (!selectedPrompt) return
    if (!data.challenge?.id) return

    console.log(`proceeding with prompt ${selectedPrompt}`)

    clearStorage()

    // add GA event for selected prompt
    browser &&
      window?.gtag?.('event', 'select_prompt', {
        event_category: 'engagement',
        event_label: selectedPrompt,
      })

    goto(drawPath(data.challenge.id))
  }

  $: mounted && selectedCategory && (selectedPrompt = prompts[0]) // this reaction needs to be defined after initialization settles to avoid overriding the saved selection
  $: {
    if (mounted && selectedPrompt) {
      selectedPromptSanityId = find((r) => r.prompt == selectedPrompt, data.gamePrompts)._id
      updateChallengePrompt(selectedPrompt)
    }
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

    <CategorySelect categories={selectableCategories} bind:selectedCategory />

    <output for="shuffle">{selectedPrompt}</output>
    <Button id="shuffle" colour="black" on:click={handleShuffle}
      >{data.copy.pick_shuffleButtonText}</Button
    >
  </section>

  <div id="cta">
    <Button
      variant="primary"
      online={data.challenge?.id && data.challenge.prompt}
      on:click={proceed}>{data.copy.pick_doneButtonText}</Button
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
