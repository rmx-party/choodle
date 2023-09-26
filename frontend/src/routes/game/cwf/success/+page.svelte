<script lang="ts">
    import Button from "../../../../components/Button.svelte";
    import {goto} from "$app/navigation";
</script>

<div>
    <h1>You got it!</h1>
    <p>Send a Choodle back to continue your streak.</p>

    <Button on:click={() => { goto('/game/cwf/pick')}} colour="yellow" variant="primary">Continue</Button>
</div>