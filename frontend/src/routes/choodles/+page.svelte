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
<Button on:click={filter('all')}>All</Button>
<Button on:click={filter('should-mint')}>Choodles That Should Be Minted</Button>
<Button on:click={filter('should-not-mint')}>Choodles That Should Not Be Minted</Button>
<div>
    <ul>
        {#each $filteredChoodles as choodle}
            <li>
                <div>
                    {choodle._id}
                    {choodle.creatorId}
                    <br/>
                    <img alt={choodle.title} src={urlFor(choodle.image)} height="300" width="300" lazy />
                    <br/>
                    {#if choodle.shouldMint}
                        <Button on:click={mint(choodle._id)}>Mint</Button>
                    {/if}
                    <Button on:click={toggleShouldMint(choodle._id)}>
                        {#if choodle.shouldMint}
                            Should Mint
                        {:else}
                            Should Not Mint
                        {/if}
                    </Button>
                </div>
            </li>
        {/each}
    </ul>
</div>
