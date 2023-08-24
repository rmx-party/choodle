<script lang="ts">
  import {browser} from "$app/environment"
  import { onMount } from 'svelte';
  import { DialogOverlay, DialogContent } from 'svelte-accessible-dialog';
  import { dialogState } from "$lib/store"

  export let initialOpen = false;
  let isOpen;
  export let onClose;
  export let id;

  onMount(() => {
    isOpen = initialOpen;

    return () => {
      dialogState.update((dialogs) => {
        console.info(`Unmounting Dialog ${id}...`, dialogs)
        delete dialogs[id]
        return dialogs
      })
    }
  })

  dialogState.subscribe((dialogs) => {
    isOpen = dialogs[id];
    console.info(`Subscription: Dialog ${id} is ${dialogs[id] ? 'open' : 'closed'}`, dialogs)
  })

  function dismiss() {
    dialogState.update(dialogs => { return { ...dialogs, [id]: false }})

    onClose?.()
  }
</script>

{#if browser}
<DialogOverlay {id} {isOpen} onDismiss={dismiss} class={`overlay`}>
  <DialogContent aria-label="Definition" class={`dialog`}>
    <button on:click={dismiss}>Close</button>

      <div class="content">
        <slot name="header" />
        <slot />
      </div>

  </DialogContent>
</DialogOverlay>
{/if}

<style>
  :global([data-svelte-dialog-overlay].overlay) {
    z-index: 1000;
    min-height: 100vh;
    min-width: 100vw;
    overflow: hidden;

    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  :global([data-svelte-dialog-content].dialog) {
    height: auto;
    width: auto;
    max-height: 90vh;
    max-width: 100vw;

    margin: 0;
    padding: 1rem;
    border-radius: 0.5rem 0.5rem 0 0;
  }
  :global([data-svelte-dialog-content] .content) {
    display: block;
    overflow: scroll;
    max-height: 100%;
    max-width: 100%;
  }
</style>
