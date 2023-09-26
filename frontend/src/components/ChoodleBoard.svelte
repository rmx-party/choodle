<script lang="ts">
    import OldChoodleBoard from "./OldChoodleBoard.svelte";
    import Prompt from "./Prompt.svelte";
    import {writable} from "svelte/store";
    import localforage from "localforage";
    import {choodlePromptKey} from "$lib/Configuration";
    import {onMount, SvelteComponent} from "svelte";
    import {browser} from "$app/environment";
    import {urlFor} from "$lib/PersistedImagesUtils";
    import Dialog from "./Dialog.svelte";
    import Button from "./Button.svelte";
    import {toHTML} from "@portabletext/to-html";

    export let id;
    export let prompt;
    export let certificateModal;

    let child : SvelteComponent<OldChoodleBoard>;

    const gamePrompt = writable<string | null>(null)
    let creatorEmailInput: string | undefined;
    let creatorEmail: string | undefined;

    const saveCreatorEmail = async (event) => {
        if (!browser) return;
        const input = document.getElementById('creator-email') as HTMLInputElement
        const validity = input.reportValidity()
        if (validity === false) return;

        console.log(`saving creator email`)
        creatorEmail = creatorEmailInput

        await localforage.setItem('choodle-creator-email', creatorEmail)

        child.oldSaveCreatorEmail()
    }

    onMount(async () => {
        if (!browser) return;
        gamePrompt.set(await localforage.getItem(choodlePromptKey))
    });
</script>

<OldChoodleBoard id={id} gamePrompt={$gamePrompt} certificateModal={certificateModal} bind:this={child}>
    <Prompt prompt={$gamePrompt || prompt.prompt} slot="prompt"/>
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
