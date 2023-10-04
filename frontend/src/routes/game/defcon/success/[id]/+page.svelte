<script lang="ts">
  import Button from "../../../../../components/Button.svelte";
  import {goto} from "$app/navigation";
  import {onMount} from "svelte";
  import {browser} from "$app/environment";
  import {toHTML} from "@portabletext/to-html";
  import {urlFor} from "$lib/PersistedImagesUtils";

  export let data;

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

  <div class="choodle-container">
    <img class="choodle" src={urlFor(data.choodle.upScaledImage).url()}
         width='390' height='520' alt=''/>
  </div>

  <h3><strong>{data.choodle.gamePrompt.toUpperCase()}</strong></h3>

  <div>
    <Button on:click={() => { goto('/game/defcon/pick')}}
            colour="yellow">{data.copy.success_continueGameButtonText}</Button>
  </div>
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
