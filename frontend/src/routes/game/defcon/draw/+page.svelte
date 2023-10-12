<script lang="ts">
  import ChoodleBoard from "../../../../components/ChoodleBoard.svelte";
  import type {UndoStack} from "$lib/UndoStack";
  import Prompt from "../../../../components/Prompt.svelte";
  import {writable} from "svelte/store";
  import {addChoodleToCreator, saveChoodle} from "$lib/ChoodleStorage";
  import {getDeviceId, getEmail, getUsername, locateCreator} from "$lib/CreatorUtils";
  import {browser} from "$app/environment";
  import {clearStorage, getUndoStack} from "$lib/StorageStuff";
  import {goto} from "$app/navigation";
  import {onMount, SvelteComponent} from "svelte";
  import localforage from "localforage";
  import {choodleCreatorUsernameKey, choodlePromptKey, pageBackgroundDefault} from "$lib/Configuration";
  import Button from "../../../../components/Button.svelte";
  import {dialogState, loading} from "$lib/store";
  import LoadingIndicator from "../../../../components/LoadingIndicator.svelte";
  import {addPoints, readOnlyClient, readWriteClient} from "$lib/CMSUtils";
  import Dialog from "../../../../components/Dialog.svelte";
  import MetaData from "../../../../components/MetaData.svelte";
  import {page} from "$app/stores";
  import LayoutContainer from "../../../../components/LayoutContainer.svelte";
  import ButtonMenu from "../../../../components/ButtonMenu.svelte";

  export let data;

  let child: SvelteComponent<ChoodleBoard>;

  let isOnline = true;
  let creatorUsername: string;
  let choodle
  let creator

  let prompt

  const gamePrompt = writable<string | null>(null)

  async function performSave(undoStack: UndoStack, canvas: HTMLCanvasElement) {
    loading.set(true)
    return await saveChoodle(undoStack, canvas, {
      gamePrompt: $gamePrompt || null,
      creatorId: await getDeviceId()
    })
  }

  const createChallenge = async ({choodle, prompt, hint, challenger, game}) => {
    return await readWriteClient.create({
      _type: "challenge",
      game,
      choodle: {_ref: choodle._id},
      challenger: {_ref: challenger._id},
      gamePrompt: prompt,
      gameHint: hint,
    }, {
      autoGenerateArrayKeys: true,
    })
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

    const deviceId = await getDeviceId()
    const email = await getEmail()

    creator = await locateCreator({email, deviceId, username: creatorUsername})

    dialogState.update(dialogs => {
      return {...dialogs, ["email-prompt"]: false}
    })

    child.save()
  }

  const afterSave = async (result) => {
    if (!browser) return;
    if (!result._id) return;
    if (!(creatorUsername.length > 0)) return;

    const deviceId = await getDeviceId()
    const email = await getEmail()
    const username = creatorUsername

    creator = await locateCreator({username, deviceId, email});

    const challenge = await createChallenge({
      choodle: result,
      prompt: $gamePrompt,
      hint: prompt.hint,
      challenger: creator,
      game: 'defcon'
    })
    addChoodleToCreator({choodleId: result._id, creatorId: creator._id})
    addPoints(creator._id, 10, "Creating a challenge.", challenge._id)

    // take us to the home page
    await goto(`/game/defcon`)

    await clearStorage()
    loading.set(false)
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

    prompt = await readOnlyClient.fetch(`*[_type == "gamePrompt" && prompt == "${$gamePrompt}"]`)
  })
</script>


<MetaData
  title="Choodle w/ Friends: DEFcon Edition"
  themeColor={pageBackgroundDefault}
  url={$page.url}
/>

{#if !$loading}
  <LayoutContainer class="no-pan">
    <Prompt prompt={$gamePrompt} instruction={data.copy.draw_topBarInstructionText} slot="topBar"/>

    <ChoodleBoard id="cwf-canvas" bind:this={child} performSave={performSave} afterSave={afterSave}>
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
