<script lang="ts">
    import {page} from "$app/stores";
    import {generateOpenSeaURL, magicFactory} from "$lib/MagicStuff.js";
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

    const share = async (event: Event) => {
        event.preventDefault()

        const img: unknown = imageData;
        const imgBlob = await (await fetch(img as URL)).blob();
        // TODO: maybe remove files from this share once opengraph metadata is
        // hooked up
        const files = [
            new File(
                [imgBlob],
                'choodle.png',
                {
                    type: 'image/png',
                    lastModified: Date.now()
                }
            )
        ];
        if (navigator.share) {
            navigator.share({
                files,
                url: location.toString()
            }).then(() => {
                console.log('Thanks for sharing!');
            }).catch(console.error);
        } else {
            console.error('Web Share API not supported')
        }
    };

    const getNftMetaData = async (tokenId: number | string) => {
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

    const showWallet = async () => {
        const magic = magicFactory()

        magic.wallet.showUI()
    }

    getNftMetaData($page.params.tokenId)
</script>

<h1>Viewing {$page.params.tokenId}</h1>

<div style="z-index: 999; text-align: center;">
    <img alt="FIXME: ALT ATTRIBUTE!" src="{imageDataValue}"/>

    <ul style="text-align: left;">
    <li>You can <a
        href="{generateOpenSeaURL($page.params.tokenId)}"
            target="_blank">view your choodle on OpenSea</a></li>
    <li><a href="#" on:click={share}>Share</a></li>
    <li><a href="#" on:click={choodleAgain}>Choodle again</a></li>
    <li><a href="#" on:click={showWallet}>Show Wallet</a></li>
    </ul>
</div>
