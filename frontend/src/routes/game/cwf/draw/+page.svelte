<script lang="ts">
  import ChoodleBoard from "../../../../components/ChoodleBoard.svelte";
  import type {UndoStack} from "$lib/UndoStack";
  import Prompt from "../../../../components/Prompt.svelte";
  import {writable} from "svelte/store";
  import {saveChoodle} from "$lib/ChoodleStorage";
  import {getDeviceId, getEmail, locateCreator} from "$lib/CreatorUtils";
  import {browser} from "$app/environment";
  import {clearStorage} from "$lib/StorageStuff";
  import {goto} from "$app/navigation";
  import {onMount} from "svelte";
  import localforage from "localforage";
  import {choodlePromptKey} from "$lib/Configuration";
  import Button from "../../../../components/Button.svelte";
  import {loading} from "$lib/store";
  import LoadingIndicator from "../../../../components/LoadingIndicator.svelte";
  import {readOnlyClient, readWriteClient} from "$lib/CMSUtils";
  import LayoutContainer from "../../../../components/LayoutContainer.svelte";
  import ButtonMenu from "../../../../components/ButtonMenu.svelte";

  export let data;

  let child;
  let isOnline = true;
  let prompt;
  let challenger;

  const gamePrompt = writable<string | null>(null)

  async function performSave(undoStack: UndoStack, canvas: HTMLCanvasElement) {
    loading.set(true)
    return saveChoodle(undoStack, canvas, {
        gamePrompt: $gamePrompt || null,
        gameHint: prompt.hint,
        creatorId: await getDeviceId()
      },
      challenger._id)
  }

  const createChallenge = async ({choodle, promptText, hint, challenger}) => {
    const challenge = await readWriteClient.create({
      _type: "challenge",
      choodle: {_ref: choodle._id},
      challenger: {_ref: challenger._id},
      gamePrompt: promptText,
      gameHint: hint,
      gamePromptRef: {_ref: prompt._id},
    }, {
      autoGenerateArrayKeys: true,
    })
    console.log(challenge)
    return challenge
  }

  const afterSave = async (result) => {
    if (!browser) return;
    if (!result._id) return;

    // create the challenge
    const challenge = await createChallenge({
      choodle: result,
      promptText: $gamePrompt,
      hint: prompt.hint,
      challenger: challenger
    })

    await goto(`/game/cwf/guess/${challenge._id}`)

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

    prompt = await readOnlyClient.fetch(`*[_type == "gamePrompt" && prompt == "${$gamePrompt}"][0]`)

    const deviceId = await getDeviceId()
    const email = await getEmail()
    challenger = await locateCreator({deviceId, email})
  })
</script>

{#if !$loading}
  <LayoutContainer>
    <Prompt prompt={$gamePrompt} instruction={data.copy.draw_topBarInstructionText} slot="topBar"/>
    <ChoodleBoard id="cwf-canvas" bind:this={child} performSave={performSave} afterSave={afterSave}>
      <ButtonMenu slot="buttons">
        <Button on:click={child.undo} colour="yellow">{data.copy.draw_undoButtonText}</Button>
        <Button on:click={child.save} isOnline={isOnline} colour="yellow">{data.copy.draw_doneButtonText}</Button>
      </ButtonMenu>
    </ChoodleBoard>
  </LayoutContainer>
{:else}
  <LoadingIndicator explanation={'saving'}/>
{/if}
