<script lang="ts">
  import ChoodleBoard from '../../../components/ChoodleBoard.svelte'
  import type { UndoStack } from '$lib/UndoStack'
  import { createUncommittedChoodle } from '$lib/ChoodleStorage'
  import { browser } from '$app/environment'
  import { clearStorage, getUndoStack } from '$lib/StorageStuff'
  import { goto, preloadData } from '$app/navigation'
  import { getContext, onMount } from 'svelte'
  import { pageBackgroundDefault } from '$lib/Configuration'
  import Button from '../../../components/Button.svelte'
  import { loading, isOnline } from '$lib/store'
  import LayoutContainer from '../../../components/LayoutContainer.svelte'
  import ButtonMenu from '../../../components/ButtonMenu.svelte'
  import MetaData from '../../../components/MetaData.svelte'
  import { page } from '$app/stores'
  import { guessPath, sharePath } from '$lib/routes'
  import type { PageData } from './$types'
  import type { Writable } from 'svelte/store'
  import type { StreakGuessingGamePlayer } from '$lib/CWFGame'
  import { updateChallenge } from '$lib/storage'

  export let data: PageData

  let child: ChoodleBoard | undefined
  let childSave: () => Promise<void> | undefined

  const deviceId: Writable<string> = getContext('deviceId')
  const challenger: Writable<StreakGuessingGamePlayer> = getContext('choodler')

  $: console.log(`draw page react`, { challenger: $challenger, deviceId: $deviceId })

  const performSave = async (undoStack: UndoStack, canvas: HTMLCanvasElement) => {
    console.log(`performSave called`, {
      challenger: $challenger,
      deviceId: $deviceId,
      challenge: data.challenge,
    })
    if (!browser || !data.challenge || !$deviceId || !$challenger) return
    loading.set(true)

    // TODO: combine the sequential server calls into a single server transaction
    const drawing = await createUncommittedChoodle({
      undoStack,
      canvas,
      extraMetadata: {
        userId: $challenger.id,
      },
    })
    const challenge = await updateChallenge({ id: data.challenge.id, drawingId: drawing.id })

    console.log(`created drawing and updated challenge`, { drawing, challenge })

    preloadData(sharePath(challenge.id))
    preloadData(guessPath(challenge.id))

    await clearStorage()
    await goto(sharePath(challenge.id))
  }

  $: prerequisitesForSavingMet = !!$deviceId && !!$challenger?.id && !!data.challenge

  const attemptToSaveChoodle = async () => {
    if (!browser) return
    console.log(`attempting to save, debug state: `, {
      challenger: $challenger,
      challenge: data.challenge,
      deviceId: $deviceId,
      child,
      childSave,
    })

    const undoStack = await getUndoStack()
    if (undoStack.current === '') throw new Error(`the undo stack is empty`)

    if (!prerequisitesForSavingMet) throw new Error(`the prereqs for saving failed`)
    loading.set(true)
    if (!childSave) throw new Error(`the child is null`)
    childSave()
  }

  onMount(async () => {
    loading.set(false)
  })
</script>

<MetaData
  title={data.pageContent.pageTitle}
  description={data.pageContent.pageDescription}
  bgColor={pageBackgroundDefault}
  url={$page.url}
/>

<LayoutContainer>
  <div class="prompt" slot="topBar">
    <span class="daily-prompt">
      <h3>
        <strong>
          {data.copy.draw_topBarInstructionText}
        </strong>
        {data.challenge?.prompt?.toUpperCase()}
      </h3>
    </span>
  </div>
  <ChoodleBoard id="cwf-canvas" bind:this={child} bind:save={childSave} {performSave}>
    <ButtonMenu slot="buttons">
      <Button id="draw-undo-button" on:click={child.undo} colour="yellow"
        >{data.copy.draw_undoButtonText}</Button
      >
      <Button
        id="draw-save-button"
        on:click={attemptToSaveChoodle}
        isOnline={$isOnline && prerequisitesForSavingMet}
        colour="yellow">{data.copy.draw_doneButtonText}</Button
      >
    </ButtonMenu>
  </ChoodleBoard>
</LayoutContainer>

<style>
  .prompt {
    display: flex;
    width: 100%;
    padding: 1rem 1rem 0.75rem 1rem;
    align-items: center;
    gap: 0.625rem;
  }
</style>
