<script lang="ts">
  import Button from "../../../../components/Button.svelte";
  import {goto} from "$app/navigation";
  import {onMount} from "svelte";
  import {browser} from "$app/environment";
  import {toHTML} from "@portabletext/to-html";

  export let data;
  // TODO: load content sections from CMS
  // TODO: load the image from CMS once the data model/routing supports it

  onMount(async () => {
    if (!browser) return;

    // Explicitly reset bg color since it sticks after being set on next page and then navigating back
    let root = document.documentElement;
    root.style.setProperty('--page-background-color', 'rgba(20, 21, 24, 0.03)');
  })
</script>

<div class="container">
  <div class="content">
    {@html toHTML(data.copy.success_topContent)}
  </div>

  <Button on:click={() => { goto('/game/cwf/pick')}} colour="yellow"
          variant="primary">{data.copy.success_continueGameButtonText}</Button>
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
