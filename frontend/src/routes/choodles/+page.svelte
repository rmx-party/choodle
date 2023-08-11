<script lang="ts">
    import {urlFor} from "$lib/PersistedImagesUtils";
    import Button from "../../components/Button.svelte";
    import fp from "lodash/fp";
    import {readWriteClient} from "$lib/CMSUtils";
    import {filterState} from "$lib/store";
    import {connectAndMint} from "$lib/MagicStuff";

    export let data = { choodles: [] };


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
            })(data.choodles)
            console.log(choodle)
            const imageUrl = readBlob((await fetch(urlFor(choodle.image))).blob())
            console.log(imageUrl)

            //connectAndMint(imageData)
        }

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
