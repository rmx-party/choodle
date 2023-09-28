<script lang="ts">
  import ChoodleBoard from "../../../../components/ChoodleBoard.svelte";
  import type {UndoStack} from "$lib/UndoStack";
  import Prompt from "../../../../components/Prompt.svelte";
  import {writable} from "svelte/store";
  import {saveChoodle} from "$lib/ChoodleStorage";
  import {getCreatorId} from "$lib/CreatorIdUtils";
  import {browser} from "$app/environment";
  import {clearStorage} from "$lib/StorageStuff";
  import {goto} from "$app/navigation";
  import {onMount} from "svelte";
  import localforage from "localforage";
  import {choodlePromptKey} from "$lib/Configuration";
  import Button from "../../../../components/Button.svelte";
  import {loading} from "$lib/store";
  import fp from "lodash/fp";

  export let data;

  let child;

  let isOnline = true;

  const gamePrompt = writable<string | null>(null)
  let gamePromptTiles: string;

  $: {
    gamePromptTiles = $gamePrompt ? fp.map((char) => {
      if (char === ' ') return '⬜'
      return '🟨'
    }, $gamePrompt.split('')).join('') : ''
  }

  async function performSave(undoStack: UndoStack, canvas: HTMLCanvasElement) {
    const asyncCreatorId = (async () => await getCreatorId())()

    return saveChoodle(undoStack, canvas, {
      gamePrompt: $gamePrompt || null,
      creatorId: await asyncCreatorId,
    })
  }

  const afterSave = async (result) => {
    if (!browser) return;
    if (!result._id) return;

    const url = `${window.location.origin}/game/cwf/guess/${result._id}`
    const shareCopy = `Can you guess what this is?` // TODO: use cms copy
    const text = [shareCopy, gamePromptTiles, url].join(`\n`)
    const shareable = {text};
    if (canShare(shareable)) {
      await share(shareable, () => {
        console.log('Thanks for sharing!');
        goto('/game/cwf/pick')
      })
    } else {
      // TODO: copy the share text + url to clipboard instead of navigate
      await goto(`/game/cwf/guess/${result._id}`)
    }

    await clearStorage()
    loading.set(false)
  }

  const canShare = (shareable?): boolean => {
    if (!browser) return false;
    if (!navigator.share) return false;

    return navigator.canShare(shareable)
  }

  const share = async (shareable, onSuccess) => {
    if (!browser) return;

    console.log(`sharing:`, shareable)

    navigator.share(shareable).then(onSuccess).catch(console.error);
  };


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

<ChoodleBoard id="cwf-canvas" bind:this={child} performSave={performSave} afterSave={afterSave}>
  <Prompt prompt={$gamePrompt} instruction={data.copy.draw_topBarInstructionText} slot="prompt"/>
  <div id="buttons" slot="buttons">
    <Button on:click={child.undo} colour="yellow">{data.copy.draw_undoButtonText}</Button>
    <Button on:click={child.save} isOnline={isOnline} colour="yellow">{data.copy.draw_doneButtonText}</Button>
  </div>
</ChoodleBoard>

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
