<script lang="ts">
    import {urlFor} from "$lib/PersistedImagesUtils";
    import Button from "../../components/Button.svelte";
    import fp from "lodash/fp";
    import {readOnlyClient, readWriteClient} from "$lib/CMSUtils";
    import {filterState} from "$lib/store";
    import {connectAndMint} from "$lib/MagicStuff";
    import {_query} from "./+page";
    import {writable} from "svelte/store";

    export let data = { choodles: [] };

    const allChoodles = writable([]);
    $: allChoodles.set([...data.choodles]);

    const filteredChoodles = writable([])
    $: filteredChoodles.set(filterChoodles($allChoodles, $filterState));

    const subscription = readOnlyClient.listen(_query).subscribe((update) => {
        const changedChoodle = update.result
        const indexToChange = fp.findIndex(c => c._id === changedChoodle._id)($allChoodles)
        const copiedChoodles = $allChoodles
        copiedChoodles[indexToChange] = changedChoodle
        allChoodles.set(copiedChoodles)
    })

    const readBlob = (b) => {
        return new Promise(function(resolve, reject) {
            const reader = new FileReader();

            reader.onloadend = function() {
                resolve(reader.result);
            };

            reader.readAsDataURL(b);
        });
    }

    const mint = (choodleId: string) => {
        return async () => {
            console.log('mint')
            const choodle = fp.find((c) => {
                return c._id === choodleId
            })($allChoodles)
            const blob = await (await fetch(urlFor(choodle.image).url())).blob()
            const imageUrl = await readBlob(blob)

            await connectAndMint(imageUrl)
            await readWriteClient.patch(choodle._id).set({shouldMint: false}).commit()
        }
    }

    const toggleShouldMint = (choodleId: string) => {
        return async () => {
            const choodle = fp.find(c => c._id === choodleId)($allChoodles)
            if (choodle.shouldMint) {
                await readWriteClient.patch(choodle._id).set({shouldMint: false}).commit()
            } else {
                await readWriteClient.patch(choodle._id).set({shouldMint: true}).commit()
            }
        }
    }

    const filter = (state: string) => {
        return () => {filterState.set(state)};
    }

    filterState.subscribe((state) => {
        console.log('subscribe filterState', state)
    })

    const filterChoodles = (choodles: [], filterState: string) => {
        if (filterState === 'all') return choodles;

        if (filterState === 'should-mint') return fp.filter(c => c.shouldMint === true)(choodles)
        if (filterState === 'should-not-mint') return fp.filter(c => c.shouldMint !== true)(choodles)
    }
</script>

<h1>Choodles!</h1>

<menu>
    <Button on:click={filter('all')}>All</Button>
    <Button on:click={filter('should-mint')}>To Mint</Button>
    <Button on:click={filter('should-not-mint')}>Not To Mint</Button>
</menu>

<div>
    <ul class="filtered-choodles">
        {#each $filteredChoodles as choodle}
            <li class={`choodle ${choodle._id} ${choodle.creatorId}`}>
                <img alt={choodle.title} src={urlFor(choodle.image)} height="100" width="100" lazy />
                <pre>
Id: {choodle._id}
Creator: {choodle.creatorId}
{#if choodle.shouldMint}
✔️  Should Mint
{:else}
🚫 Should Not Mint
{/if}
                </pre>
                <menu>
                    <Button on:click={toggleShouldMint(choodle._id)}>
                        Toggle
                    </Button>
                    {#if choodle.shouldMint}
                        <Button on:click={mint(choodle._id)}>Mint</Button>
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
    whitespace: pre-wrap;
    justify-self: flex-start;
    flex-grow: 1;
}
.choodle menu {
    justify-self: flex-end;
}
</style>
