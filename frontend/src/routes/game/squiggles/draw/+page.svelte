<script lang="ts">
  import ChoodleBoard from "../../../../components/ChoodleBoard.svelte";
  import type {UndoStack} from "$lib/UndoStack";
  import Prompt from "../../../../components/Prompt.svelte";
  import {writable} from "svelte/store";
  import {saveChoodle} from "$lib/ChoodleStorage";
  import {getDeviceId, getEmail, getUsername, locateCreator} from "$lib/CreatorUtils";
  import {browser} from "$app/environment";
  import {clearStorage} from "$lib/StorageStuff";
  import {goto} from "$app/navigation";
  import {onMount, SvelteComponent} from "svelte";
  import localforage from "localforage";
  import {
    pageBackgroundDefault,
    choodlePromptKey,

    choodleYellow

  } from "$lib/Configuration";
  import Button from "../../../../components/Button.svelte";
  import {loading, loadingMessage, isOnline} from "$lib/store";
  import MetaData from "../../../../components/MetaData.svelte";
  import {page} from "$app/stores";
  import LayoutContainer from "../../../../components/LayoutContainer.svelte";
  import ButtonMenu from "../../../../components/ButtonMenu.svelte";

  export let data;

  let child: SvelteComponent<ChoodleBoard>;

  let creator

  const gamePrompt = writable<string | null>(null)

  async function performSave(undoStack: UndoStack, canvas: HTMLCanvasElement) {
    loading.set(true)
    loadingMessage.set('saving')

    const choodleId = await saveChoodle(undoStack, canvas, {
      gamePrompt: $gamePrompt || null,
      creatorId: await getDeviceId()
    })

    const deviceId = await getDeviceId()
    const email = await getEmail()
    const username = await getUsername()

    creator = await locateCreator({username, deviceId, email});

    // take us to the home page
    await goto(`/c/${choodleId}`)

    await clearStorage()
    loading.set(false)
  }

  onMount(async () => {
    gamePrompt.set(await localforage.getItem(choodlePromptKey))
    loading.set(false)
  })
</script>

<MetaData
  title="Squiggles"
  themeColor={choodleYellow}
  bgColor={pageBackgroundDefault}
  url={$page.url}
/>

<LayoutContainer class="no-pan">
  <div slot="topBar" style="width: 100%;">
    <Prompt prompt={`Add just one line to create your own doodle!`} instruction={`Draw:`}/>
  </div>

  <ChoodleBoard id="squiggles-canvas" bind:this={child} {performSave}>
    <ButtonMenu slot="buttons">
      <Button on:click={child.undo} colour="yellow">{data.copy.draw_undoButtonText}</Button>
      <Button on:click={child.save} {isOnline}
        colour="yellow">{data.copy.draw_doneButtonText}</Button>
    </ButtonMenu>
  </ChoodleBoard>
</LayoutContainer>


