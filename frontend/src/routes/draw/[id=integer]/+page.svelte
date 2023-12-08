<script lang="ts">
  import ChoodleBoard from '../../../components/ChoodleBoard.svelte'
  import type { UndoStack } from '$lib/UndoStack'
  import { createUncommittedChoodle as saveDrawing } from '$lib/ChoodleStorage'
  import { browser } from '$app/environment'
  import { clearStorage, getUndoStack } from '$lib/StorageStuff'
  import { goto } from '$app/navigation'
  import { getContext } from 'svelte'
  import { pageBackgroundDefault } from '$lib/Configuration'
  import Button from '../../../components/Button.svelte'
  import { isOnline, addLoadingReason } from '$lib/store'
  import LayoutContainer from '../../../components/LayoutContainer.svelte'
  import ButtonMenu from '../../../components/ButtonMenu.svelte'
  import MetaData from '../../../components/MetaData.svelte'
  import { page } from '$app/stores'
  import { sharePath } from '$lib/routes'
  import type { PageData } from './$types'
  import type { Writable } from 'svelte/store'
  import { updateChallenge } from '$lib/storage'
  import type { User } from '@prisma/client'

  export let data: PageData

  let child: ChoodleBoard | undefined
  let childSave: () => Promise<void> | undefined

  const deviceId: Writable<string> = getContext('deviceId')
  const challenger: Writable<User> = getContext('choodler')

  $: console.log(`draw page react`, { challenger: $challenger, deviceId: $deviceId })

  let prerequisitesForSavingMet = false
  $: {
    prerequisitesForSavingMet =
      browser && !!$deviceId && !!$challenger?.id && !!data.challenge && $isOnline
  }

  const performSave = async (undoStack: UndoStack, canvas: HTMLCanvasElement) => {
    if (!prerequisitesForSavingMet) throw new Error(`the prereqs for saving failed`)

    // TODO: combine the sequential server calls into a single server transaction
    const drawing = await addLoadingReason(
      'savingDrawing',
      saveDrawing({
        undoStack,
        canvas,
        extraMetadata: {
          userId: $challenger.id,
        },
      })
    )
    const challenge = await addLoadingReason(
      'updateChallenge',
      updateChallenge({ id: data.challenge.id, drawingId: drawing.id })
    )

    console.log(`created drawing and updated challenge`, { drawing, challenge })
    addLoadingReason('clearStorage', clearStorage())

    await goto(sharePath(challenge.id))
  }

  const attemptToSaveChoodle = async () => {
    if (!prerequisitesForSavingMet) throw new Error(`the prereqs for saving failed`)

    const undoStack = await getUndoStack()
    if (!undoStack?.current?.length) throw new Error(`the undo stack is empty`)

    if (!childSave) throw new Error(`the child is null`)
    addLoadingReason('childSave', childSave())
  }
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
        isOnline={prerequisitesForSavingMet}
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
