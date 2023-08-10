<script lang="ts">
    import {urlFor} from "$lib/PersistedImagesUtils";
    import Button from "../../components/Button.svelte";
    import fp from "lodash/fp";
    import {readWriteClient} from "$lib/CMSUtils";
    import {filterState} from "$lib/store";

    export let data = { choodles: [] };

    const mint = () => {
        console.log('mint')
    }

    const toggleShouldMint = (choodleId: string) => {
        return async () => {
            const choodle = fp.find(c => c._id === choodleId)(data?.choodles)
            if (choodle.shouldMint) {
                console.log(await readWriteClient.patch(choodle._id).set({shouldMint: false}).commit())
            } else {
                console.log(await readWriteClient.patch(choodle._id).set({shouldMint: true}).commit())
            }
        }
    }


    const filter = (state: string) => {
        return () => {filterState.set(state)};
    }

    filterState.subscribe((state) => {
        console.log('subscribe filterState', state)
    })

    const filteredChoodles = (filterState: string) => {
        console.log("filteredChoodles(", filterState)
        console.log(data.choodles)
        if (!data.choodles) return [];

        if (filterState === 'all') return data.choodles;

        if (filterState === 'should-mint') return fp.filter(c => c.shouldMint === true)(data.choodles)
        if (filterState === 'should-not-mint') return fp.filter(c => c.shouldMint !== true)(data.choodles)
    }
</script>

<h1>Choodles!</h1>
<Button on:click={filter('all')}>All</Button>
<Button on:click={filter('should-mint')}>Choodles That Should Be Minted</Button>
<Button on:click={filter('should-not-mint')}>Choodles That Should Not Be Minted</Button>
<div>
    <ul>
        {#each filteredChoodles($filterState) as choodle}
            <li>
                <div>
                    {choodle._id}
                    {choodle.creatorId}
                    <br/>
                    <img alt={choodle.title} src={urlFor(choodle.upScaledImage)} height="300" width="300"/>
                    <br/>
                    {#if choodle.shouldMint}
                        <Button on:click={mint}>Mint</Button>
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
