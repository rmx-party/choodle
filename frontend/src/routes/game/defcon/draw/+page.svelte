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
  import {
    choodleCreatorUsernameKey,
    choodlePromptKey
  } from "$lib/Configuration";
  import Button from "../../../../components/Button.svelte";
  import {dialogState, loading} from "$lib/store";
  import LoadingIndicator from "../../../../components/LoadingIndicator.svelte";
  import {readOnlyClient, readWriteClient} from "$lib/CMSUtils";
  import Dialog from "../../../../components/Dialog.svelte";

  export let data;

  let child: SvelteComponent<ChoodleBoard>;

  let isOnline = true;
  let creatorUsername: string | undefined;
  let choodle;

  const gamePrompt = writable<string | null>(null)

  async function performSave(undoStack: UndoStack, canvas: HTMLCanvasElement) {
    loading.set(true)
    return saveChoodle(undoStack, canvas, {
      gamePrompt: $gamePrompt || null,
      creatorId: await getDeviceId()
    })
  }

  const createChallenge = async ({choodle, prompt, challenger}) => {
    await readWriteClient.create({
      _type: "challenge",
      choodle: {_ref: choodle._id},
      challenger: {_ref: challenger._id},
      gamePrompt: prompt,
    }, {
      autoGenerateArrayKeys: true,
    })
  }

  const promptForUsernameOrSave = async (event: Event) => {
    if (!browser) return;

    const undoStack = await getUndoStack()
    if (undoStack.current === '') return loading.set(false);

    const asyncCreatorUsername = (async () => creatorUsername = await localforage.getItem(choodleCreatorUsernameKey))()

    if (!creatorUsername && !await asyncCreatorUsername) {
      console.log(`prompting for username...`)
      dialogState.update(dialogs => {
        return {...dialogs, ["username-prompt"]: true}
      })
    } else {
      console.log(`saving without email...`)
      child.save(event)
    }
  }

  const saveUsername = async () => {
    if (!browser) return;
    if (creatorUsername === "") return;

    console.log(`saving creator email`)
    await localforage.setItem(choodleCreatorUsernameKey, creatorUsername)

    const deviceId = await getDeviceId()
    const creatorEmail = await getEmail()
    let query = `*[_type == "creator"][deviceIds match "${deviceId}"`
    if (creatorEmail) {
      query += ` || email match "${creatorEmail}"`
    }
    if (creatorUsername) {
      query += ` || username match "${creatorUsername}"`
    }
    query += "]"

    const creator = (await readOnlyClient.fetch(query))[0]
    if (creator) {
      await readWriteClient
        .patch(creator._id)
        .setIfMissing({username: creatorUsername})
        .commit()
    } else {
      await readWriteClient.create({
        _type: "creator",
        username: creatorUsername,
        email: creatorEmail,
        deviceIds: [deviceId],
        choodles: [{_ref: choodle._id}]
      }, {
        autoGenerateArrayKeys: true,
      })
    }
    dialogState.update(dialogs => {
      return {...dialogs, ["email-prompt"]: false}
    })

    child.save(event)
  }

  const addPoints = async (creatorId, amount, reason) => {
    await readWriteClient.create(
      {
        _type: "points",
        creator: {_ref: creatorId},
        game: 'defcon',
        amount,
        reason,
      }
    )
  }

  const afterSave = async (result) => {
    if (!browser) return;
    if (!result._id) return;

    const deviceId = await getDeviceId()
    const email = await getEmail()
    const username = await getUsername()

    const challenger = await locateCreator({username, deviceId, email});

    createChallenge({choodle: result, prompt: $gamePrompt, challenger: challenger})
    addChoodleToCreator(result._id, await getDeviceId())

    addPoints(challenger._id, 10, "Creating a challenge.")
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
  })
</script>

{#if !$loading}
  <ChoodleBoard id="cwf-canvas" bind:this={child} performSave={performSave} afterSave={afterSave}>
    <Prompt prompt={$gamePrompt} instruction={data.copy.draw_topBarInstructionText} slot="prompt"/>
    <div id="buttons" slot="buttons">
      <Button on:click={child.undo} colour="yellow">{data.copy.draw_undoButtonText}</Button>
      <Button on:click={promptForUsernameOrSave} isOnline={isOnline}
              colour="yellow">{data.copy.draw_doneButtonText}</Button>
    </div>
    <Dialog id={'username-prompt'}>
      <header slot="header">Placeholder</header>
      <div>lorem ipsum</div>
      <label for="creator-username" style="text-align: left; display: block; font-family: Dejavu Sans Bold;">username
        <br/>
        <input bind:value={creatorUsername} type="username" id="creator-username" name="creatorusername"
               placeholder="Enter username"
               style='width: 100%; padding: 1rem 0.5rem; border-radius: 0.25rem; margin: 0.5rem 0;'/>
      </label>
      <Button on:click={saveUsername} variant="primary" colour="yellow">
        Placeholder Save
      </Button>
    </Dialog>
  </ChoodleBoard>
{:else}
  <LoadingIndicator explanation={'saving'}/>
{/if}

<style>
  #buttons {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    flex-wrap: wrap;
    flex-direction: row;
    align-content: center;
    gap: 1rem;
    padding: 0 1rem 1rem;
    margin: 0;
  }
</style>
