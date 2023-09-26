<script lang="ts">
    import OldChoodleBoard from "./OldChoodleBoard.svelte";
    import Prompt from "./Prompt.svelte";
    import {writable} from "svelte/store";
    import localforage from "localforage";
    import {choodlePromptKey} from "$lib/Configuration";
    import {onMount} from "svelte";
    import {browser} from "$app/environment";

    export let id;
    export let prompt;
    export let certificateModal;

    const gamePrompt = writable<string | null>(null)

    onMount(async () => {
        if (!browser) return;
        gamePrompt.set(await localforage.getItem(choodlePromptKey))
    });
</script>

<OldChoodleBoard id={id} gamePrompt={$gamePrompt} certificateModal={certificateModal}>
    <Prompt prompt={$gamePrompt || prompt.prompt} slot="prompt"/>
</OldChoodleBoard>
