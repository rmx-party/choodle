<script lang="ts">
  import ChoodleBoard from "../../../../components/ChoodleBoard.svelte";
  import type {UndoStack} from "$lib/UndoStack";
  import Prompt from "../../../../components/Prompt.svelte";
  import {writable} from "svelte/store";
  import {createUncommittedChoodle} from "$lib/ChoodleStorage";
  import {getDeviceId, getEmail, getUsername, locateCreator} from "$lib/CreatorUtils";
  import {browser} from "$app/environment";
  import {clearStorage, getUndoStack} from "$lib/StorageStuff";
  import {goto} from "$app/navigation";
  import {onMount} from "svelte";
  import localforage from "localforage";
  import {choodleCreatorUsernameKey, choodlePromptKey} from "$lib/Configuration";
  import Button from "../../../../components/Button.svelte";
  import {dialogState, loading} from "$lib/store";
  import LoadingIndicator from "../../../../components/LoadingIndicator.svelte";
  import {readOnlyClient} from "$lib/CMSUtils";
  import LayoutContainer from "../../../../components/LayoutContainer.svelte";
  import ButtonMenu from "../../../../components/ButtonMenu.svelte";
  import Dialog from "../../../../components/Dialog.svelte";

  export let data;

  let child;
  let isOnline = true;
  let prompt;
  let challenger;

  let creatorUsername: string;

  const gamePrompt = writable<string | null>(null)

  async function performSave(undoStack: UndoStack, canvas: HTMLCanvasElement) {
    loading.set(true)

    const {transaction, choodleId} = await createUncommittedChoodle(undoStack, canvas, {
        gamePrompt: $gamePrompt || null,
        gameHint: prompt.hint,
        creatorId: await getDeviceId()
      },
      challenger._id)

    let challengeId = `challenge-${window.crypto.randomUUID()}`;
    transaction.create({
      _id: challengeId,
      _type: "challenge",
      choodle: {_ref: choodleId},
      challenger: {_ref: challenger._id},
      gamePrompt: $gamePrompt,
      gameHint: prompt.hint,
      gamePromptRef: {_ref: prompt._id},
    })

    await transaction.commit({
      autoGenerateArrayKeys: true,
    })

    await goto(`/game/cwf/guess/${challengeId}`)

    await clearStorage()
    loading.set(false)
  }

  const promptForUsernameAndSave = async (event: Event) => {
    if (!browser) return;

    const undoStack = await getUndoStack()
    if (undoStack.current === '') return loading.set(false);

    if (creatorUsername.length > 0) return await saveUsername();

    console.log(`prompting for username...`)
    dialogState.update(dialogs => {
      return {...dialogs, ["username-prompt"]: true}
    })
  }

  const saveUsername = async () => {
    if (!browser) return;
    if (!(creatorUsername.length > 0)) return;

    console.log(`saving creator username`)
    await localforage.setItem(choodleCreatorUsernameKey, creatorUsername)

    dialogState.update(dialogs => {
      return {...dialogs, ["email-prompt"]: false}
    })

    child.save()
  }

  onMount(async () => {
    if (!browser) return;

    window.addEventListener('online', () => {
      console.log('online')
      isOnline = true
    })
    window.addEventListener('offline', () => {
      console.log('offline')
      isOnline = false
    })

    gamePrompt.set(await localforage.getItem(choodlePromptKey))
    creatorUsername = (await getUsername()) || ''

    prompt = await readOnlyClient.fetch(`*[_type == "gamePrompt" && prompt == "${$gamePrompt}"][0]`)

    const deviceId = await getDeviceId()
    const email = await getEmail()
    challenger = await locateCreator({deviceId, email})
  })
</script>

{#if !$loading}
  <LayoutContainer>
    <Prompt prompt={$gamePrompt} instruction={data.copy.draw_topBarInstructionText} slot="topBar"/>
    <ChoodleBoard id="cwf-canvas" bind:this={child} performSave={performSave}>
      <ButtonMenu slot="buttons">
        <Button on:click={child.undo} colour="yellow">{data.copy.draw_undoButtonText}</Button>
        <Button on:click={promptForUsernameAndSave} isOnline={isOnline}
                colour="yellow">{data.copy.draw_doneButtonText}</Button>
      </ButtonMenu>

      <Dialog id={'username-prompt'}>
        <header slot="header">{data.copy.draw_usernameHeader}</header>
        <div>{data.copy.draw_usernameInstructions}</div>
        <label for="creator-username" style="text-align: left; display: block; font-family: Dejavu Sans Bold;">username
          <br/>
          <input bind:value={creatorUsername} type="username" id="creator-username" name="creatorusername"
                 placeholder="{data.copy.draw_usernamePlaceholder}"
                 style='width: 100%; padding: 1rem 0.5rem; border-radius: 0.25rem; margin: 0.5rem 0;'/>
        </label>
        <Button on:click={saveUsername} variant="primary" colour="yellow">
          {data.copy.draw_usernameSaveButtonText}
        </Button>
      </Dialog>
    </ChoodleBoard>
  </LayoutContainer>
{:else}
  <LoadingIndicator explanation={'saving'}/>
{/if}
