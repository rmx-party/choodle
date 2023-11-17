<script>
  import Dialog from '~/components/Dialog.svelte'
  import Button from '~/components/Button.svelte'
  import { toHTML } from '@portabletext/to-html'

  export let headerContent
  export let placeholderContent
  export let saveButtonText
  export let usernameValue
  export let onClick = () => {}

  const usernamePromptId = 'username-prompt'
</script>

<Dialog id={usernamePromptId} enableCloseButton={false}>
  <header slot="header">{@html toHTML(headerContent)}</header>
  <label
    for="creator-username"
    style="text-align: left; display: block; font-family: Dejavu Sans Bold;"
    >username
    <br />
    <input
      autofocus
      bind:value={usernameValue}
      type="username"
      id="creator-username"
      name="creatorusername"
      placeholder={placeholderContent}
      style="width: 100%; padding: 1rem 0.5rem; border-radius: 0.25rem; margin: 0.5rem 0;"
    />
  </label>
  <Button id="save-username-btn" on:click={onClick} variant="primary" colour="yellow">
    {saveButtonText}
  </Button>
</Dialog>
