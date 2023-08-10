<script lang="ts">
    import {urlFor} from "$lib/PersistedImagesUtils";
    import Button from "../../components/Button.svelte";
    import fp from "lodash/fp";
    import {readWriteClient} from "$lib/CMSUtils";

    export let data = {};

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
</script>

<h1>Choodles!</h1>
<div>
    <ul>
        {#each data.choodles as choodle}
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
