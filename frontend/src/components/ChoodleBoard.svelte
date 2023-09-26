<script lang="ts">
    import OldChoodleBoard from "./OldChoodleBoard.svelte";
    import Prompt from "./Prompt.svelte";
    import {writable} from "svelte/store";
    import localforage from "localforage";
    import {choodleCreatorEmailKey, choodlePromptKey} from "$lib/Configuration";
    import {onMount, SvelteComponent} from "svelte";
    import {browser} from "$app/environment";
    import {urlFor} from "$lib/PersistedImagesUtils";
    import Dialog from "./Dialog.svelte";
    import Button from "./Button.svelte";
    import {toHTML} from "@portabletext/to-html";
    import {dialogState, loading} from "$lib/store";
    import {getUndoStack} from "$lib/StorageStuff";

    export let id;
    export let prompt;
    export let certificateModal;

    let child: SvelteComponent<OldChoodleBoard>;

    let isOnline = true;

    const gamePrompt = writable<string | null>(null)
    let creatorEmailInput: string | undefined;
    let creatorEmail: string | undefined;

    const promptForEmailOrSave = async (event: Event) => {
        if (!browser) return;

        const undoStack = await getUndoStack()
        if (undoStack.current === '') return loading.set(false);

        const asyncCreatorEmail = (async () => creatorEmail = await localforage.getItem('choodle-creator-email'))()

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

        const storedCreatorEmail = await localforage.getItem('choodle-creator-email');
        if (storedCreatorEmail) {
            creatorEmail = storedCreatorEmail
        }

        gamePrompt.set(await localforage.getItem(choodlePromptKey))
    });
</script>

<OldChoodleBoard id={id} gamePrompt={$gamePrompt} certificateModal={certificateModal} bind:this={child}>
    <Prompt prompt={$gamePrompt || prompt.prompt} slot="prompt"/>
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
</OldChoodleBoard>

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