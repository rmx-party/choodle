<script lang="ts">
  import { browser } from '$app/environment'
  import { onMount } from 'svelte'
  import { DialogOverlay, DialogContent } from 'svelte-accessible-dialog'
  import { dialogState } from '$lib/store'
  import closeBtn from '$lib/assets/icon-close-32px.svg'

  export let initialOpen = false
  let isOpen: boolean
  export let onClose = () => {}
  export let id: string

  export let enableCloseButton = true

  onMount(() => {
    isOpen = initialOpen

    return () => {
      dialogState.update((dialogs) => {
        console.info(`Unmounting Dialog ${id}...`, dialogs)
        delete dialogs[id]
        return dialogs
      })
    }
  })

  dialogState.subscribe((dialogs) => {
    isOpen = dialogs[id]
    console.info(`Subscription: Dialog ${id} is ${dialogs[id] ? 'open' : 'closed'}`, dialogs)
  })

  function dismiss() {
    dialogState.update((dialogs) => {
      return { ...dialogs, [id]: false }
    })

    onClose?.()
  }
</script>

{#if browser}
  <DialogOverlay {id} {isOpen} onDismiss={enableCloseButton ? dismiss : () => {}} class={`overlay`}>
    <DialogContent aria-label="Dialog" class={`dialog`}>
      {#if enableCloseButton}
        <button class="close-btn" on:click={enableCloseButton ? dismiss : () => {}}>
          <img src={closeBtn} alt="icon of an X for exit" title="close dialog" />
        </button>
      {/if}

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
    height: 100dvh;
    width: 100dvw;
    overflow: hidden;

    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: env(safe-area-inset-top, 1rem) env(safe-area-inset-right, 1rem)
      env(safe-area-inset-bottom, 1rem) env(safe-area-inset-left, 1rem);
  }

  :global([data-svelte-dialog-content].dialog) {
    height: auto;
    width: 100%;
    max-height: 98dvh;
    max-width: 720px;
    max-width: clamp(200px, 720px, 100dvw);

    margin: 0 auto;
    padding: 1rem 1rem 0;
    border-radius: 0.5rem 0.5rem 0 0;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    touch-action: pan-x pan-y;
    touch-action: none;
  }
  :global([data-svelte-dialog-content] .content) {
    display: block;
    overflow: scroll;
    width: 100%;
    height: auto;
    flex-grow: 1;
    padding: 1rem 0;
  }

  .close-btn {
    border: none;
    background: none;
    padding: 0;
    margin: 0;
    align-self: flex-end;
    height: 2rem;
    width: 2rem;
  }

  :global([data-svelte-dialog-content] .content h1) {
    margin-bottom: 0;
  }
</style>
