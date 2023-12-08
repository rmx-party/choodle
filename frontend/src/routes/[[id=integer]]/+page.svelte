<script lang="ts">
  import { browser } from '$app/environment'
  import { goto, invalidate, preloadData } from '$app/navigation'
  import find from 'lodash/fp/find'
  import map from 'lodash/fp/map'
  import { getContext } from 'svelte'
  import { toHTML } from '@portabletext/to-html'
  import { page } from '$app/stores'
  import Button from '../../components/Button.svelte'
  import LayoutContainer from '../../components/LayoutContainer.svelte'
  import MetaData from '../../components/MetaData.svelte'
  import { addLoadingReason, uncaughtErrors } from '$lib/store'
  import { clearStorage } from '$lib/StorageStuff'
  import shuffle from 'lodash/fp/shuffle'
  import { drawPath, pickPath } from '$lib/routes'
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
  import type { StreakGuessingGamePrompt } from '$lib/CWFGame'

  type PromptCategory = SanityDocument & {
    label: string
  }

  export let data: PageData
  const currentChoodler: Writable<User> = getContext('choodler')

  // let mounted = false
  let prompts: StreakGuessingGamePrompt[]
  let selectedPrompt: StreakGuessingGamePrompt | undefined
  let selectedPromptSanityId: string | undefined
  let selectableCategories: PromptCategory[] = []
  let selectedCategory: PromptCategory | undefined = undefined

  $: selectableCategories = flow(map('category'), uniqBy('_id'), compact)(data.gamePrompts)
  $: {
    if (data.challenge?.promptSanityId) {
      setCategoryFromPromptId(data.challenge.promptSanityId)
      prompts = selectablePrompts(data.gamePrompts, selectedCategory)
      selectedPrompt = findPromptById(data.challenge?.promptSanityId)
    } else {
      prompts = selectablePrompts(data.gamePrompts, selectedCategory)
      selectedPrompt = prompts.pop()
      setCategoryFromPromptId(data.challenge.promptSanityId)
    }
    console.log({
      challenge: data.challenge,
      selectedPrompt: selectedPrompt?.prompt,
      selectedCategory: selectedCategory?.label,
    })
  }
  $: selectedPromptSanityId = selectedPrompt?._id

  $: data.challenge?.prompt && updateChallengePrompt(selectedPrompt)
  $: respondToSelectedCategory(selectedCategory)

  $: {
    if (
      (!data.challenge && selectedPromptSanityId) ||
      data.challenge?.userId !== $currentChoodler?.id
    ) {
      addLoadingReason('initializeChallenge', initializeChallenge())
    }
  }

  $: console.log({ selectableCategories })
  $: console.log({ selectedCategory })
  $: console.log({ prompts })
  $: console.log({ selectedPrompt })

  const initializeChallenge = async () => {
    if (!$currentChoodler?.id) return
    if (data.challenge?.userId == $currentChoodler?.id) return
    if (!selectedPromptSanityId || !selectedPrompt) return

    // TODO: don't create another empty challenge if user already has an empty one to fill

    console.log(`creating new challenge`, {
      prompt: selectedPrompt.prompt,
      promptSanityId: selectedPromptSanityId,
      userId: $currentChoodler.id,
      challengeId: data.challenge?.id,
    })

    await createChallenge({
      prompt: selectedPrompt.prompt,
      promptSanityId: selectedPromptSanityId,
    })
      .then(async (newChallenge) => {
        console.log(`created new challenge, going to it`)
        await goto(`/${newChallenge.id}`)
        preloadData(drawPath(newChallenge.id))
      })
      .catch((err) => {
        console.error(err)
        uncaughtErrors.set([...$uncaughtErrors, err])
      })
  }

  const setCategoryFromPromptId = (promptSanityId: string) => {
    if (!promptSanityId) return

    if (!selectableCategories.length) throw new Error(`no category found`)
    const category =
      find((r) => r._id == promptSanityId, data.gamePrompts).category || selectableCategories[0]
    if (!category) throw new Error(`no category found`)

    if (selectedCategory?._id === category._id) return
    selectedCategory = category
  }

  const findPromptById = (promptSanityId: string) => {
    if (!promptSanityId) return
    return find((r) => r._id == promptSanityId, data.gamePrompts)
  }

  const rotatePrompts = () => {
    console.log(prompts.length, 'prompts left')
    if (prompts.length >= 1) {
      selectedPrompt = prompts.pop()
      return
    }

    console.log(`no more prompts, resetting`)
    prompts = selectablePrompts(data.gamePrompts, selectedCategory)
  }

  const handleShuffle = (event: Event) => {
    if (!browser) return
    event.preventDefault()

    // add GA event for skipped prompt
    window?.gtag?.('event', 'skip_prompt', {
      event_category: 'engagement',
      event_label: selectedPrompt?.prompt,
    })

    rotatePrompts()
  }

  const updateChallengePrompt = async (gamePrompt: StreakGuessingGamePrompt | undefined) => {
    const id = data.challenge?.id
    if (!id) return
    if (!gamePrompt?._id) return
    if (
      data.challenge?.promptSanityId === gamePrompt._id &&
      data.challenge.prompt === gamePrompt.prompt
    )
      return

    console.log(`updating challenge prompt to ${gamePrompt.prompt}`)
    await updateChallenge({
      id,
      prompt: gamePrompt.prompt,
      promptSanityId: gamePrompt._id,
    })
    invalidate(pickPath(id))
    invalidate(drawPath(id))
  }

  const proceed = async () => {
    if (!selectedPrompt) return
    if (!data.challenge?.id) return

    console.log(`proceeding with prompt ${selectedPrompt.prompt}`)

    clearStorage()

    // add GA event for selected prompt
    browser &&
      window?.gtag?.('event', 'select_prompt', {
        event_category: 'engagement',
        event_label: selectedPrompt.prompt,
      })

    goto(drawPath(data.challenge.id))
  }

  const respondToSelectedCategory = (category: PromptCategory | undefined) => {
    if (!category?._id) return
    console.log(`responding to selected category`, category)
    prompts = selectablePrompts(data.gamePrompts, category)
    // TODO: if the new prompts list contains the selected prompt, don't update it
    if (!selectedPrompt) return
    if (!prompts.includes(selectedPrompt)) {
      console.log(`selecting prompt from new category list`)
      selectedPrompt = prompts.pop()
    }
  }

  const selectablePrompts = (gamePrompts: StreakGuessingGamePrompt[], category: PromptCategory) => {
    return flow(
      compact,
      filter((r: PromptCategory) => r.category?._id === category?._id),
      uniq,
      shuffle
    )(gamePrompts)
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

    <output for="shuffle">{selectedPrompt?.prompt}</output>
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
