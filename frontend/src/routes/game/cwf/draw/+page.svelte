<script lang="ts">
  import ChoodleBoard from "../../../../components/ChoodleBoard.svelte";
  import type {UndoStack} from "$lib/UndoStack";
  import Prompt from "../../../../components/Prompt.svelte";
  import {writable} from "svelte/store";
  import {saveChoodle} from "$lib/ChoodleStorage";
  import {getDeviceId} from "$lib/CreatorUtils";
  import {browser} from "$app/environment";
  import {clearStorage} from "$lib/StorageStuff";
  import {goto} from "$app/navigation";
  import {onMount} from "svelte";
  import localforage from "localforage";
  import {choodleCreatorEmailKey, choodlePromptKey} from "$lib/Configuration";
  import Button from "../../../../components/Button.svelte";
  import {loading} from "$lib/store";
  import LoadingIndicator from "../../../../components/LoadingIndicator.svelte";
  import {readOnlyClient, readWriteClient} from "$lib/CMSUtils";

  export let data;

  let child;
  let isOnline = true;

  const gamePrompt = writable<string | null>(null)

  async function performSave(undoStack: UndoStack, canvas: HTMLCanvasElement) {
    loading.set(true)
    return saveChoodle(undoStack, canvas, {
      gamePrompt: $gamePrompt || null,
      creatorId: await getDeviceId()
    })
  }

  const locateCreator = async () => {
    const deviceId = getDeviceId()
    const creatorEmail = await localforage.getItem(choodleCreatorEmailKey)
    const query = `*[_type == "creator"][deviceIds match "${deviceId}" || email match "${creatorEmail}"]`
    return (await readOnlyClient.fetch(query))[0]
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

  const afterSave = async (result) => {
    if (!browser) return;
    if (!result._id) return;

    // create the challenge
    createChallenge({choodle: result, prompt: $gamePrompt, challenger: await locateCreator()})

    await goto(`/game/cwf/guess/${result._id}`)

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
      <Button on:click={child.save} isOnline={isOnline} colour="yellow">{data.copy.draw_doneButtonText}</Button>
    </div>
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
