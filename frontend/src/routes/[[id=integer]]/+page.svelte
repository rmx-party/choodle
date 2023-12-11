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
  import { createChallenge, updateChallenge, updateMyCategory } from '$lib/storage'
  import type { Writable } from 'svelte/store'
  import type { Challenge, User } from '@prisma/client'
  import CategorySelect from '../../components/CategorySelect.svelte'
  import uniq from 'lodash/fp/uniq'
  import compact from 'lodash/fp/compact'
  import flow from 'lodash/fp/flow'
  import filter from 'lodash/fp/filter'
  import uniqBy from 'lodash/fp/uniqBy'
  import type { SanityDocument } from '@sanity/client'
  import type { StreakGuessingGamePrompt } from '$lib/CWFGame'
  import ShuffleSelect from '../../components/ShuffleSelect.svelte'
  import shuffleIcon from '$lib/assets/shuffle.svg'

  type PromptCategory = SanityDocument & {
    label: string
    slug: string
  }

  export let data: PageData
  const currentChoodler: Writable<User> = getContext('choodler')

  // let mounted = false
  let selectableCategories: PromptCategory[] = []
  let selectedCategory: PromptCategory | undefined = undefined
  let selectedCategoryId: string | undefined = undefined

  let prompts: StreakGuessingGamePrompt[]
  let selectedPrompt: StreakGuessingGamePrompt | undefined
  let selectedPromptSanityId: string | undefined

  $: selectableCategories = flow(map('category'), uniqBy('_id'), compact)(data.gamePrompts)

  $: initializeFromUser($currentChoodler)

  $: selectedCategory = find((r) => r._id == selectedCategoryId, selectableCategories)
  $: prompts = selectablePrompts(data.gamePrompts, selectedCategoryId)

  $: initializeFromSavedChallenge(data.challenge)

  const initializeFromSavedChallenge = (challenge: Challenge | null) => {
    if (!$currentChoodler || !challenge?.promptSanityId) return

    console.log(`initializing from saved challenge`, data.challenge)

    setCategoryFromPromptId(challenge.promptSanityId)

    selectedPrompt = findPromptById(challenge.promptSanityId)
  }
  const initializeFromUser = (user: User | undefined) => {
    if (!user) return
    if (!user.defaultCategorySlug) return
    const category = find((r) => r.slug == user.defaultCategorySlug, selectableCategories)
    if (!category) return
    if (category._id === selectedCategoryId) return

    console.log(`initializing selected category from user:`, category.slug)
    selectedCategoryId = category._id
  }

  $: respondToSelectedCategory(selectedCategory)
  $: selectedPromptSanityId = selectedPrompt?._id

  $: data.challenge?.prompt && updateChallengePrompt(selectedPrompt)

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
      userCategory: $currentChoodler.defaultCategorySlug,
      challengeId: data.challenge?.id,
      category: selectedCategory?.label,
    })

    return await createChallenge({
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
    console.log(`setting category from prompt id`, promptSanityId)
    if (!selectableCategories.length) throw new Error(`no category found`)
    let category = selectableCategories[0]

    const promptById = find((r) => r._id == promptSanityId, data.gamePrompts)
    category = promptById?.category || selectableCategories[0]
    if (!category) throw new Error(`no category found`)

    if (selectedCategoryId === category._id) return

    console.log(`setting category to ${category.label}`, promptById?.prompt)
    selectedCategoryId = category._id
    selectedCategory = category
  }

  const findPromptById = (promptSanityId: string) => {
    if (!promptSanityId) return
    return find((r) => r._id == promptSanityId, data.gamePrompts)
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
    prompts = selectablePrompts(data.gamePrompts, category._id)

    // TODO: save category slug to user's defaultCategorySlug
    if ($currentChoodler && $currentChoodler?.defaultCategorySlug !== category.slug) {
      updateMyCategory(category)
    }

    if (!selectedPrompt) return
    if (!prompts.includes(selectedPrompt)) {
      console.log(`selecting prompt from new category list`)
      selectedPrompt = prompts[0]
    }
  }

  const selectablePrompts = (
    gamePrompts: StreakGuessingGamePrompt[],
    categoryId: string | undefined
  ) => {
    console.log(`selectablePrompts`, { gamePrompts, categoryId })
    return flow(
      compact,
      filter((r: PromptCategory) => (categoryId ? r.category?._id === categoryId : true)),
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
  <section>
    <section>
      <div class="block-content">
        {@html toHTML(data.copy.pick_promptSelectionPageTopContent)}
      </div>
      <div class="pickCategory">
        {#if selectableCategories.length > 1 && selectedCategoryId}
          <CategorySelect
            categories={selectableCategories}
            bind:selectedCategoryId
            disabled={!selectableCategories.length}
          />
        {/if}
      </div>
    </section>

    <section>
      <div class="block-content">
        {@html toHTML(data.copy.pick_promptSelectionPageMiddleContent)}
      </div>

      <div class="pickPrompt">
        <ShuffleSelect
          options={prompts}
          bind:selectedOption={selectedPrompt}
          disabled={!data.challenge?.prompt || !selectedCategoryId}
        >
          <span slot="button">
            <img src={shuffleIcon} alt="shuffle" />
          </span>
        </ShuffleSelect>
      </div>
    </section>
  </section>

  <div id="cta">
    <Button
      variant="primary"
      online={data.challenge?.id && data.challenge.prompt}
      on:click={proceed}>{data.copy.pick_doneButtonText}</Button
    >
  </div>

  <section class="block-content">
    {@html toHTML(data.copy.landing_content_bottom)}
  </section>
</LayoutContainer>

<style>
  section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    width: 100%;
  }
  section > section {
    gap: 0.75rem;
  }

  .pickPrompt,
  .pickCategory,
  .block-content {
    margin: 0;
    width: 100%;
    padding: 0;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .pickPrompt,
  .pickCategory {
    width: 20rem;
  }

  #cta {
    width: 100%;
  }
</style>
