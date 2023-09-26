<script lang="ts">
    import ChoodleBoard from "../../../../components/ChoodleBoard.svelte";
    import {UndoStack} from "$lib/UndoStack";
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

    let child;

    let isOnline = true;

    const gamePrompt = writable<string | null>(null)

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

        await clearStorage()

        await goto(`/game/cwf/guess/${result._id}`)
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

<ChoodleBoard id="cwf-canvas" bind:this={child} performSave={performSave} afterSave={afterSave}>
    <Prompt prompt={$gamePrompt} slot="prompt" />
    <div id="buttons" slot="buttons">
        <Button on:click={child.undo} colour="yellow">Undo</Button>
        <Button on:click={child.save} isOnline={isOnline} colour="yellow">Done</Button>
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
