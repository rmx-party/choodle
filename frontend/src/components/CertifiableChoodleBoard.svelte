<script lang="ts">
  import Prompt from "./Prompt.svelte";
  import localforage from "localforage";
  import {
    choodleCreatorEmailKey,
  } from "$lib/Configuration";
  import {onMount, SvelteComponent} from "svelte";
  import {browser} from "$app/environment";
  import {urlFor} from "$lib/PersistedImagesUtils";
  import Dialog from "./Dialog.svelte";
  import Button from "./Button.svelte";
  import {toHTML} from "@portabletext/to-html";
  import {dialogState, loading, loadingMessage} from "$lib/store";
  import {clearStorage, getUndoStack} from "$lib/StorageStuff";
  import {goto} from "$app/navigation";
  import type {UndoStack} from "$lib/UndoStack";
  import ChoodleBoard from "./ChoodleBoard.svelte";
  import {saveChoodle} from "$lib/ChoodleStorage";
  import {getDeviceId} from "$lib/CreatorUtils";

  export let id;
  export let prompt;
  export let certificateModal;

  let child: SvelteComponent<ChoodleBoard>;

  let isOnline = true;

  let creatorEmailInput: string | undefined;
  let creatorEmail: string | undefined;

  const promptForEmailOrSave = async (event: Event) => {
    if (!browser) return;

    const undoStack = await getUndoStack()
    if (undoStack.current === '') return loading.set(false);

    const asyncCreatorEmail = (async () => creatorEmail = await localforage.getItem(choodleCreatorEmailKey))()

    if (!creatorEmail && !await asyncCreatorEmail) {
      console.log(`prompting for email...`)
      dialogState.update(dialogs => {
        return {...dialogs, ["email-prompt"]: true}
      })
    } else {
      console.log(`saving without email...`)
      child.save(event)
    }
  }

  const saveCreatorEmail = async (event) => {
    if (!browser) return;
    const input = document.getElementById('creator-email') as HTMLInputElement
    const validity = input.reportValidity()
    if (validity === false) return;

    console.log(`saving creator email`)
    creatorEmail = creatorEmailInput

    await localforage.setItem(choodleCreatorEmailKey, creatorEmail)

    // TODO: maybe also instruct server to remap sanity creator id to email

    dialogState.update(dialogs => {
      return {...dialogs, ["email-prompt"]: false}
    })
    child.save(event)
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

    const storedCreatorEmail = await localforage.getItem(choodleCreatorEmailKey);
    if (storedCreatorEmail) {
      creatorEmail = storedCreatorEmail
    }
  });

  async function sendCreatorCertificate({creatorEmail, choodleId}: { creatorEmail: string, choodleId: string }) {
    console.log(`sending certificate to ${creatorEmail} for ${choodleId}`)
    const pendingRequest = fetch(`/api/certificateMail`, {
      method: 'POST',
      body: JSON.stringify({creatorEmail, choodleId}),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const json = await (await pendingRequest).json()
    console.log(`creator certificate result`, json)

    return json
  }

  async function performSave(undoStack: UndoStack, canvas: HTMLCanvasElement) {
    const asyncCreatorId = (async () => await getDeviceId())()

    return saveChoodle(undoStack, canvas, {
      creatorId: await asyncCreatorId,
    })
  }

  const afterSave = async (result) => {
    if (!browser) return;
    if (!result._id) return;

    let sendingCertificate;
    const clearingStorage = clearStorage()
    const creatorEmail = await localforage.getItem(choodleCreatorEmailKey)
    if (creatorEmail) {
      sendingCertificate = sendCreatorCertificate({creatorEmail, choodleId: result._id})
      loadingMessage.set('generating certificate')
    }

    const promises = [clearingStorage, sendingCertificate]
    console.log(`awaiting promises`, promises)
    await Promise.all(promises) // TODO: may need to handle error with user feedback
    console.log(`promises resolved, navigating`)

    await goto(`/c/${result._id}`)
  }
</script>

<ChoodleBoard id={id} bind:this={child} performSave={performSave} afterSave={afterSave}>
  <Prompt prompt={prompt.prompt} slot="prompt"/>
  <div id="buttons" slot="buttons">
    <Button on:click={child.undo} colour="yellow">Undo</Button>
    <Button on:click={promptForEmailOrSave} isOnline={isOnline} colour="yellow">Done</Button>
  </div>
  <Dialog id={'email-prompt'}>
    <header slot="header">{@html toHTML(certificateModal.title)}</header>
    {#if certificateModal.Image}
      <img height="100" style="margin: 1.5rem;" src="{urlFor(certificateModal.Image)}" alt="Choodle Certificate"/>
    {/if}
    <div>{@html toHTML(certificateModal.body)}</div>
    <br/>

    <label for="creator-email" style="text-align: left; display: block; font-family: Dejavu Sans Bold;">Email
      <br/>
      <input bind:value={creatorEmailInput} type="email" id="creator-email" name="creatorEmail"
             placeholder="Enter Email"
             required title="Please enter a valid email address as the creator to attribute this art to" style='width: 100%; padding:
    1rem 0.5rem; border-radius: 0.25rem; margin: 0.5rem 0;'/>
    </label>

    <Button on:click={saveCreatorEmail} variant="primary"
            colour="yellow">{certificateModal.CTA}</Button>
  </Dialog>
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
