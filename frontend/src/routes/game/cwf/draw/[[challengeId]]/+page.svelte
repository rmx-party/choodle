<script lang="ts">
  import ChoodleBoard from "../../../../../components/ChoodleBoard.svelte";
  import type {UndoStack} from "$lib/UndoStack";
  import Prompt from "../../../../../components/Prompt.svelte";
  import {writable} from "svelte/store";
  import {createUncommittedChoodle} from "$lib/ChoodleStorage";
  import {getDeviceId, getEmail, getUsername, locateCreator} from "$lib/CreatorUtils";
  import {browser} from "$app/environment";
  import {clearStorage, getUndoStack} from "$lib/StorageStuff";
  import {goto} from "$app/navigation";
  import {onMount} from "svelte";
  import localforage from "localforage";
  import {choodleCreatorUsernameKey, choodlePromptKey, choodleYellow, pageBackgroundDefault} from "$lib/Configuration";
  import Button from "../../../../../components/Button.svelte";
  import {loading, isOnline, loadingMessage, closeDialog, openDialog} from "$lib/store";
  import {readOnlyClient, readWriteClient} from "$lib/CMSUtils";
  import LayoutContainer from "../../../../../components/LayoutContainer.svelte";
  import ButtonMenu from "../../../../../components/ButtonMenu.svelte";
  import Dialog from "../../../../../components/Dialog.svelte";
  import MetaData from "../../../../../components/MetaData.svelte";
  import {page} from "$app/stores";

  export let data;

  let child;
  let prompt;
  let challenger;
  let challenge;

  let creatorUsername: string;

  const gamePrompt = writable<string | null>(null)

  async function performSave(undoStack: UndoStack, canvas: HTMLCanvasElement) {
    loadingMessage.set('saving')
    loading.set(true)
    let challengeId
    const {transaction, choodleId} = await createUncommittedChoodle(undoStack, canvas, {
        gamePrompt: $gamePrompt || null,
        creatorId: await getDeviceId()
      },
      challenger._id)

    if ($page.params.challengeId) {
      console.log(`patching in the choodle ${choodleId} to challenge ${challenge._id}`)
      transaction.patch($page.params.challengeId, p => p.set({choodle: {_ref: choodleId}}))
    } else {
      challengeId = `challenge-${window.crypto.randomUUID()}`;
      transaction.create({
        _id: challengeId,
        _type: "challenge",
        choodle: {_ref: choodleId},
        challenger: {_ref: challenger._id},
        gamePrompt: $gamePrompt,
        gamePromptRef: {_ref: prompt._id},
      })
    }

    const transactionResult = await transaction.commit({
      autoGenerateArrayKeys: true,
    })

    console.log({transactionResult})

    await clearStorage()
    if ($page.params.challengeId) {
      await goto(`/game/cwf/guess/${$page.params.challengeId}`)
    } else {
      await goto(`/game/cwf/guess/${challengeId}`)
    }
  }

  const usernamePromptId = 'username-prompt'

  // TODO: switch back for username driven gameplay after prod deploy
  const usernameRequired = true;
  const attemptToSaveChoodleRequiringUsername = async (event: Event) => {
    if (!browser) return;

    const undoStack = await getUndoStack()
    if (undoStack.current === '') return loading.set(false);

    if (creatorUsername.length > 0) {
      closeDialog(usernamePromptId)
      await localforage.setItem(choodleCreatorUsernameKey, creatorUsername)
      child.save()
      return
    }

    openDialog(usernamePromptId)
  }
  const attemptToSaveChoodle = async (event: Event) => {
    if (!browser) return;

    const undoStack = await getUndoStack()
    if (undoStack.current === '') return loading.set(false);

    if (usernameRequired) {
      return await attemptToSaveChoodleRequiringUsername(event)
    } else {
      child.save()
      return
    }
  }

  onMount(async () => {
    gamePrompt.set(await localforage.getItem(choodlePromptKey))
    creatorUsername = (await getUsername()) || ''

    prompt = await readOnlyClient.fetch(`*[_type == "gamePrompt" && prompt == "${$gamePrompt}"][0]`)
    console.log({prompt})

    const deviceId = await getDeviceId()
    const email = await getEmail()

    console.log({challengeId: $page.params.challengeId})
    if ($page.params.challengeId) {
      challenge = await readOnlyClient.fetch(`*[_type == "challenge" && _id == "${$page.params.challengeId}"]{..., challenger->{...}, choodle->{...}, gamePromptRef->{...}} [0]`);
      challenger = challenge.challenger._id
      console.log({challenger})
    } else {
      challenger = await locateCreator({deviceId, email})
    }
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
  <Prompt prompt={$gamePrompt} instruction={data.copy.draw_topBarInstructionText} slot="topBar"/>
  <ChoodleBoard id="cwf-canvas" bind:this={child} {performSave}>
    <ButtonMenu slot="buttons">
      <Button on:click={child.undo} colour="yellow">{data.copy.draw_undoButtonText}</Button>
      <Button on:click={attemptToSaveChoodle} isOnline={$isOnline}
              colour="yellow">{data.copy.draw_doneButtonText}</Button>
    </ButtonMenu>

    <Dialog id={usernamePromptId}>
      <header slot="header">{data.copy.draw_usernameHeader}</header>
      <div>{data.copy.draw_usernameInstructions}</div>
      <label for="creator-username" style="text-align: left; display: block; font-family: Dejavu Sans Bold;">username
        <br/>
        <input bind:value={creatorUsername} type="username" id="creator-username" name="creatorusername"
               placeholder="{data.copy.draw_usernamePlaceholder}"
               style='width: 100%; padding: 1rem 0.5rem; border-radius: 0.25rem; margin: 0.5rem 0;'/>
      </label>
      <Button on:click={attemptToSaveChoodle} variant="primary" colour="yellow">
        {data.copy.draw_usernameSaveButtonText}
      </Button>
    </Dialog>
  </ChoodleBoard>
</LayoutContainer>
