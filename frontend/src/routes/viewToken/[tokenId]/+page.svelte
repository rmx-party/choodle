<script lang="ts">
    import {page} from "$app/stores";
    import {generateOpenSeaURL} from "$lib/MagicStuff.js";
    import {imageData, tokenId} from "$lib/store.js";
    import {clearStorage} from "$lib/CanvasStuff.js";
    import {goto} from "$app/navigation";
    import {PUBLIC_CONTRACT_ADDRESS} from "$env/static/public";
    import {Alchemy, BigNumber, Network} from "alchemy-sdk";

    let imageDataValue;
    imageData.subscribe(value => {
        imageDataValue = value
    })

    let tokenIdValue;
    tokenId.subscribe(value => {
        tokenIdValue = value
    })
    tokenId.set($page.params.tokenId)

    const choodleAgain = async (event: Event) => {
        tokenId.set(null)
        await clearStorage()
        await goto("/")
        window.location.reload()
    }

    const getNftMetaData = async (tokenId: number) => {
        const settings = {
            apiKey: "L2vtx4tW7tXeREsqVqRUs-OjaSilNFWn",
            network: Network.MATIC_MUMBAI
        };

        const alchemy = new Alchemy(settings);

        const response = await alchemy.nft.getNftMetadata(
            PUBLIC_CONTRACT_ADDRESS,
            tokenId.toString()
        );

        if (response?.media?.length > 0) {
            imageData.set(response.media[0].raw)
        }
    }

    getNftMetaData(tokenIdValue)
</script>

<h1>Viewing {$page.params.tokenId}</h1>

<div id="openSeaLink" style="z-index: 999">
    <p>You can view your minted choodle on <a href="{generateOpenSeaURL($page.params.tokenId)}"
                                              target="_blank">OpenSea</a>.
    </p>
    <p><a href="#" on:click={choodleAgain}>Choodle again.</a></p>

    <img src="{imageDataValue}"/>
</div>
