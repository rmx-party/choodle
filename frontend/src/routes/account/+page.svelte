<script lang="ts">
  import { browser } from "$app/environment";
  import { choodleCreatorEmailKey, choodleCreatorIdKey, choodleCreatorUsernameKey, choodlePersistedCreatorIdKey, choodlePromptKey, choodleUndoKey } from "$lib/Configuration";
  import { locateCreator, getEmail, getUsername, getDeviceId } from "$lib/CreatorUtils";
  import localforage from "localforage";
  import { onMount } from "svelte";
  import Button from "../../components/Button.svelte";


  let creator

  const accountLocalDataKeys: string[] = [
    choodleCreatorEmailKey,
    choodleCreatorUsernameKey,
    choodleCreatorIdKey,
    choodlePersistedCreatorIdKey,
  ]
  let accountLocalDataValues: Record<string, string | null> = {}
  const choodleLocalDataKeys: string[] = [
    choodleUndoKey,
    choodlePromptKey,
  ]
  let choodleLocalDataValues: Record<string, string | null> = {}

  const clearAccountLocalData = async () => {
    accountLocalDataKeys.forEach(async (key) => {
      await localforage.removeItem(key)
    })
    await refreshLocalData()
  }
  const clearChoodleLocalData = async () => {
    choodleLocalDataKeys.forEach(async (key) => {
      await localforage.removeItem(key)
    })
    await refreshLocalData()
  }

  const refreshLocalData = async () => {
    accountLocalDataKeys.forEach(async (key: string) => {
      accountLocalDataValues[key] = await localforage.getItem(key)
    })
    choodleLocalDataKeys.forEach(async (key: string) => {
      choodleLocalDataValues[key] = await localforage.getItem(key)
    })
  }

  onMount(async () => {
    if (!browser) return;

    creator = (await locateCreator({
      email: await getEmail(),
      username: await getUsername(),
      deviceId: await getDeviceId()
    })); // TODO: migrate global creator/player state to a store shared across pages
    console.log({creator})

    refreshLocalData()
  })
</script>


<h1>Account Management</h1>

<Button on:click={clearAccountLocalData}>clear browser account storage</Button>

<pre>
{#each accountLocalDataKeys as key}
{`${key}: ${accountLocalDataValues[key]} \n`}
{/each}
</pre>

<Button on:click={clearChoodleLocalData}>clear browser choodle storage</Button>

<pre>
{#each choodleLocalDataKeys as key}
{`${key}: ${choodleLocalDataValues[key]} \n`}
{/each}
</pre>
