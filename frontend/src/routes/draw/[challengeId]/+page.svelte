<script lang="ts">
  import ChoodleBoard from '../../../components/ChoodleBoard.svelte'
  import type { UndoStack } from '$lib/UndoStack'
  import { createUncommittedChoodle } from '$lib/ChoodleStorage'
  import { getDeviceId, locateCreator } from '$lib/CreatorUtils'
  import { browser } from '$app/environment'
  import { clearStorage, getUndoStack } from '$lib/StorageStuff'
  import { goto, preloadData } from '$app/navigation'
  import { onMount } from 'svelte'
  import localforage from 'localforage'
  import { choodleYellow, pageBackgroundDefault } from '$lib/Configuration'
  import Button from '../../../components/Button.svelte'
  import { loading, isOnline, loadingMessage, closeDialog, openDialog } from '$lib/store'
  import LayoutContainer from '../../../components/LayoutContainer.svelte'
  import ButtonMenu from '../../../components/ButtonMenu.svelte'
  import Dialog from '../../../components/Dialog.svelte'
  import MetaData from '../../../components/MetaData.svelte'
  import { page } from '$app/stores'
  import { guessPath, sharePath } from '$lib/routes'
  import { readWriteClient } from '$lib/CMSUtils'

  export let data

  let child
  let challenger
  let challenge

  let username: string

  async function performSave(undoStack: UndoStack, canvas: HTMLCanvasElement) {
    loadingMessage.set('saving')
    loading.set(true)
    const { transaction, choodleId } = await createUncommittedChoodle(
      undoStack,
      canvas,
      {
        creatorId: await getDeviceId(),
      },
      challenger._id
    )

    console.log(
      `patching in the choodle ${choodleId} to challenge ${data.challenge._id} with challenger ${challenger._id}`
    )
    transaction.patch(data.challenge._id, (p) =>
      p.set({
        choodle: { _ref: choodleId },
        challenger: { _ref: challenger._id },
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

  const usernamePromptId = 'username-prompt'

  // TODO: switch back for username driven gameplay after prod deploy
  const usernameRequired = true
  const attemptToSaveChoodleRequiringUsername = async (_event: Event) => {
    if (!browser) return

    const undoStack = await getUndoStack()
    if (undoStack.current === '') return loading.set(false)

    if (username?.length > 0) {
      await readWriteClient.patch(challenger._id).set({ username }).commit()
      closeDialog(usernamePromptId)
      child.save()
      return
    }

    openDialog(usernamePromptId)
  }
  const attemptToSaveChoodle = async (event: Event) => {
    if (!browser) return

    const undoStack = await getUndoStack()
    if (undoStack.current === '') return loading.set(false)

    if (usernameRequired) {
      return await attemptToSaveChoodleRequiringUsername(event)
    } else {
      child.save()
      return
    }
  }

  onMount(async () => {
    const deviceId = await getDeviceId()

    challenger = await locateCreator({ deviceId })
    username = challenger.username

    loading.set(false)
  })
</script>

<MetaData
  title={data.copy.defaultPageTitle}
  themeColor={choodleYellow}
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
  <ChoodleBoard id="cwf-canvas" bind:this={child} {performSave}>
    <ButtonMenu slot="buttons">
      <Button on:click={child.undo} colour="yellow">{data.copy.draw_undoButtonText}</Button>
      <Button on:click={attemptToSaveChoodle} isOnline={$isOnline} colour="yellow"
        >{data.copy.draw_doneButtonText}</Button
      >
    </ButtonMenu>

    <Dialog id={usernamePromptId}>
      <header slot="header">{data.copy.draw_usernameHeader}</header>
      <div>{data.copy.draw_usernameInstructions}</div>
      <label
        for="creator-username"
        style="text-align: left; display: block; font-family: Dejavu Sans Bold;"
        >username
        <br />
        <input
          bind:value={username}
          type="username"
          id="creator-username"
          name="creatorusername"
          placeholder={data.copy.draw_usernamePlaceholder}
          style="width: 100%; padding: 1rem 0.5rem; border-radius: 0.25rem; margin: 0.5rem 0;"
        />
      </label>
      <Button on:click={attemptToSaveChoodle} variant="primary" colour="yellow">
        {data.copy.draw_usernameSaveButtonText}
      </Button>
    </Dialog>
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
