<script lang="ts">
    import Button from "../../../../components/Button.svelte";
    import {goto} from "$app/navigation";
    import { onMount } from "svelte";
    import { browser } from "$app/environment";

    export let data;
    // TODO: load content section from CMS

    onMount(async () => {
        if (!browser) return;

        // Explicitly reset bg color since it sticks after being set on next page and then navigating back
        let root = document.documentElement;
        root.style.setProperty('--page-background-color', 'rgba(20, 21, 24, 0.03)');
    })
</script>

<div class="container">
  <div class="content">
    <h1>You got it!</h1>
    <p>Send a Choodle back to continue your streak.</p>
  </div>

  <Button on:click={() => { goto('/game/cwf/pick')}} colour="yellow" variant="primary">Continue</Button>
</div>


<style>
  .container {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    height: 100vh;
    padding: 1.5rem;
    text-align: center;
    gap: 1.5rem;
  }
</style>
