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
    const { transaction, choodleId } = await createUncommittedChoodle(
      undoStack,
      canvas,
      {
        creatorId: $deviceId,
      },
      $challenger._id
    )

    console.log(
      `patching in the choodle ${choodleId} to challenge ${data.challenge._id} with challenger ${$challenger._id}`
    )
    transaction.patch(data.challenge._id, (p) =>
      p.set({
        choodle: { _ref: choodleId },
        challenger: { _ref: $challenger._id },
      })
    )

    const transactionResult = await transaction.commit({
      autoGenerateArrayKeys: true,
    })

    console.log({ transactionResult })

    preloadData(sharePath(data.challenge._id))
    preloadData(guessPath(data.challenge._id))

    await clearStorage()
    await goto(sharePath(data.challenge._id))
  }

  $: prerequisitesForSavingMet = !!$deviceId && !!$challenger?._id && !!data.challenge

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
        {data.challenge?.gamePrompt?.prompt?.toUpperCase()}
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
