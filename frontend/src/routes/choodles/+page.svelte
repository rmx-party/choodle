<script lang="ts">
  import { urlFor } from '$lib/PersistedImagesUtils';
  import Button from '../../components/Button.svelte';
  import fp from 'lodash/fp';
  import { readOnlyClient, readWriteClient } from '$lib/CMSUtils';
  import { filterState } from '$lib/store';
  import { connectAndMint, sendAChoodle } from '$lib/MagicStuff';
  import { _query } from './+page';
  import { writable, type Writable } from 'svelte/store';
  import { readBlob } from '$lib/ImageUtils';

  export let data = { choodles: [] };

  const allChoodles: Writable<any[]> = writable([]);
  $: allChoodles.set([...data.choodles]);

  const filteredChoodles: Writable<any[]> = writable([]);
  $: filteredChoodles.set(filterChoodles($allChoodles, $filterState));

  const subscription = readOnlyClient.listen(_query).subscribe((update) => {
    const changedChoodle = update.result;
    const indexToChange = fp.findIndex((c) => c._id === changedChoodle._id)($allChoodles);
    const copiedChoodles = $allChoodles;
    copiedChoodles[indexToChange] = changedChoodle;
    allChoodles.set(copiedChoodles);
  });

  const mint = (choodleId: string) => {
    return async () => {
      console.log('mint');
      const choodle = fp.find((c) => {
        return c._id === choodleId;
      })($allChoodles);

      console.log(`choodle`, choodle);
      if (!choodle) return;

      const blob = await (await fetch(urlFor(choodle.image).url())).blob();
      const imageUrl = await readBlob(blob);

      const tokenId = await connectAndMint(imageUrl, choodle.creatorId, choodle._createdAt);
      if (tokenId) {
        await readWriteClient
          .patch(choodle._id)
          .set({ shouldMint: false, mintedAt: new Date().toISOString(), tokenId: tokenId })
          .commit();
      }
    };
  };

  const send = (tokenId) => {
    return async () => {
      const choodle = fp.find((c) => {
        return c.tokenId === tokenId;
      })($allChoodles);

      const sentTo = await sendAChoodle(tokenId);
      if (sentTo) {
        await readWriteClient
          .patch(choodle._id)
          .set({
            shouldMint: false,
            sentAt: new Date().toISOString(),
            sentTo,
          })
          .commit();
      }
    };
  };

  const toggleShouldMint = (choodleId: string) => {
    return async () => {
      const choodle = fp.find((c) => c._id === choodleId)($allChoodles);
      if (choodle.shouldMint) {
        await readWriteClient.patch(choodle._id).set({ shouldMint: false }).commit();
      } else {
        await readWriteClient.patch(choodle._id).set({ shouldMint: true }).commit();
      }
    };
  };

  const filter = (state: string) => {
    return () => {
      filterState.set(state);
    };
  };

  filterState.subscribe((state) => {
    console.log('subscribe filterState', state);
  });

  const filterChoodles = (choodles: any[], filterState: string) => {
    let filtered = [];
    const activeFilter = {
      all: () => choodles,
      'should-mint': fp.filter((c) => c.shouldMint === true),
      'should-not-mint': fp.filter((c) => !c.shouldMint && !c.tokenId && !c.sentAt),
      minted: fp.filter((c) => !!c.tokenId && !c.sentAt),
      sent: fp.filter((c) => !!c.sentAt),
    }[filterState];
    console.log(`activeFilter`, activeFilter);

    filtered = activeFilter(choodles);

    return fp.sortBy(['_createdAt'])(filtered);
  };
</script>

<h1>Choodles!</h1>

<menu>
  <Button on:click={filter('all')}>All</Button>
  <Button on:click={filter('should-not-mint')}>Don't Mint</Button>
  <Button on:click={filter('should-mint')}>Mint Plz</Button>
  <Button on:click={filter('minted')}>Minted Not Sent</Button>
  <Button on:click={filter('sent')}>Sent</Button>
</menu>

<div>
  <ul class="filtered-choodles">
    {#each $filteredChoodles as choodle}
      <li class={`choodle ${choodle._id} ${choodle.creatorId}`}>
        <img alt={choodle.title} src={urlFor(choodle.image)} height="100" width="100" lazy />
        <pre>
Id: {choodle._id}
Creator: {choodle.creatorId}
Created At: {new Date(choodle._createdAt).toISOString()}
{#if choodle.mintedAt}
            Minted At: {choodle.mintedAt}
tokenId: {choodle.tokenId}
          {/if}
{#if choodle.sentAt}
            sent at: {choodle.sentAt}
sent to: {choodle.sentTo}
          {/if}
{#if choodle.shouldMint}
            ✔️  Should Mint
          {:else}
            🚫 Should Not Mint
          {/if}
                </pre>
        <menu>
          <Button on:click={toggleShouldMint(choodle._id)}>Toggle</Button>
          {#if choodle.shouldMint}
            <Button on:click={mint(choodle._id)}>Mint</Button>
          {/if}
          {#if choodle.mintedAt && choodle.tokenId}
            <Button on:click={send(choodle.tokenId)}>Send</Button>
          {/if}
        </menu>
      </li>
    {/each}
  </ul>
</div>

<style>
  h1 {
    text-align: center;
  }
  menu {
    display: flex;
    flex-direction: row;
  }

  .filtered-choodles {
    margin: 0;
    padding: 0;
    width: 100%;
  }
  .choodle {
    width: 100%;
    list-style-type: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.5rem 0;
    border-bottom: 2px solid hsla(0, 0%, 60%, 0.1);
  }
  .choodle > * {
    margin: 0;
    padding: 0;
  }
  .choodle img {
    flex-shrink: 1;
    object-fit: contain;
  }
  .choodle pre {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: pre-wrap;
    justify-self: flex-start;
    flex-grow: 1;
  }
  .choodle menu {
    justify-self: flex-end;
  }
</style>
