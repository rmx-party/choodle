<script lang="ts">
  import ChoodleBoard from '../../../components/ChoodleBoard.svelte'
  import type { UndoStack } from '$lib/UndoStack'
  import { createUncommittedChoodle } from '$lib/ChoodleStorage'
  import { browser } from '$app/environment'
  import { clearStorage, getUndoStack } from '$lib/StorageStuff'
  import { goto, preloadData } from '$app/navigation'
  import { getContext, onMount } from 'svelte'
  import { choodleYellow, pageBackgroundDefault } from '$lib/Configuration'
  import Button from '../../../components/Button.svelte'
  import { loading, isOnline, closeDialog, openDialog } from '$lib/store'
  import LayoutContainer from '../../../components/LayoutContainer.svelte'
  import ButtonMenu from '../../../components/ButtonMenu.svelte'
  import MetaData from '../../../components/MetaData.svelte'
  import { page } from '$app/stores'
  import { guessPath, sharePath } from '$lib/routes'
  import { readWriteClient } from '$lib/CMSUtils'
  import type { PageData } from './$types'
  import type { Writable } from 'svelte/store'
  import type { StreakGuessingGamePlayer } from '$lib/CWFGame'
  import UserNameModal from '../../../components/UserNameModal.svelte'

  export let data: PageData

  let child: ChoodleBoard
  const deviceId: Writable<string> = getContext('deviceId')
  const challenger: Writable<StreakGuessingGamePlayer> = getContext('choodler')
  const usernamePromptId = 'username-prompt'

  let username: string | undefined
  $: {
    if ($challenger?.username?.length) {
      // Assign this once when the user loads, don't fight with the input binding
      username = $challenger.username
    }
  }
  $: console.log(`draw page react`, { challenger: $challenger, deviceId: $deviceId })

  const performSave = async (undoStack: UndoStack, canvas: HTMLCanvasElement) => {
    if (!browser || !data.challenge || !$deviceId || $challenger?.username) return
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

  // TODO: switch back for username driven gameplay after prod deploy
  const usernameRequired = true
  const attemptToSaveChoodleRequiringUsername = async () => {
    if (!browser) return

    const undoStack = await getUndoStack()
    if (undoStack.current === '') return loading.set(false)

    if (username?.length > 0) {
      loading.set(true)
      await readWriteClient.patch($challenger._id).set({ username }).commit()
      closeDialog(usernamePromptId)
      child.save()
      return
    }

    openDialog(usernamePromptId)
  }
  const attemptToSaveChoodle = async () => {
    if (!browser) return

    const undoStack = await getUndoStack()
    if (undoStack.current === '') return loading.set(false)

    if (usernameRequired) {
      return await attemptToSaveChoodleRequiringUsername()
    } else {
      if (!data.challenge || !$deviceId || $challenger?.username) return
      loading.set(true)
      child.save()
      return
    }
  }

  onMount(async () => {
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
  </ChoodleBoard>
</LayoutContainer>

<UserNameModal
  headerContent={data.copy.draw_usernameHeader}
  placeholderContent={data.copy.draw_usernamePlaceholder}
  saveButtonText={data.copy.draw_usernameSaveButtonText}
  bind:usernameValue={username}
  onClick={attemptToSaveChoodle}
/>

<style>
  .prompt {
    display: flex;
    width: 100%;
    padding: 1rem 1rem 0.75rem 1rem;
    align-items: center;
    gap: 0.625rem;
  }
</style>
