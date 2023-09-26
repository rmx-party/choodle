<script lang="ts">
    import OldChoodleBoard from "./OldChoodleBoard.svelte";

    export let id;
    export let prompt;
    export let certificateModal;
</script>

<OldChoodleBoard id={id} prompt={prompt} certificateModal={certificateModal}></OldChoodleBoard>
