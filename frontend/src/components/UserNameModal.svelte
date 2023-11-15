<script>
  import Dialog from '~/components/Dialog.svelte'
  import Button from '~/components/Button.svelte'

  export let headerContent
  export let instructionsContent
  export let placeholderContent
  export let saveButtonText
  export let usernameValue
  export let onClick = () => {}

  const usernamePromptId = 'username-prompt'
</script>

<Dialog id={usernamePromptId}>
  <header slot="header">{headerContent}</header>
  <div>{instructionsContent}</div>
  <label
    for="creator-username"
    style="text-align: left; display: block; font-family: Dejavu Sans Bold;"
    >username
    <br />
    <input
      bind:value={usernameValue}
      type="username"
      id="creator-username"
      name="creatorusername"
      placeholder={placeholderContent}
      style="width: 100%; padding: 1rem 0.5rem; border-radius: 0.25rem; margin: 0.5rem 0;"
    />
  </label>
  <Button on:click={onClick} variant="primary" colour="yellow">
    {saveButtonText}
  </Button>
</Dialog>
