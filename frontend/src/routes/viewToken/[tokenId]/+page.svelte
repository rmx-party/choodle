<script lang="ts">
    import LoadingIndicator from "../../../LoadingIndicator.svelte";
    import {page} from "$app/stores";
    import {generateOpenSeaURL, magicFactory} from "$lib/MagicStuff.js";
    import {imageData, tokenId, nftTitle, nftAlt, nftDescription, loading} from "$lib/store.js";
    import {clearStorage} from "$lib/CanvasStuff.js";
    import {goto} from "$app/navigation";
    import {PUBLIC_CONTRACT_ADDRESS} from "$env/static/public";
    import {Alchemy, Network} from "alchemy-sdk";
    import {get} from "svelte/store";

    tokenId.set(parseInt($page.params.tokenId))
    loading.set(true)

    const choodleAgain = async (event: Event) => {
        tokenId.set(null)
        await clearStorage()
        await goto("/")
        window.location.reload()
    }

    const share = async (event: Event) => {
        event.preventDefault()

        const img: unknown = get(imageData);
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
        console.log('page url: ', $page.url)
        if (navigator.share) {
            navigator.share({
                //files,
                url: $page.url
            }).then(() => {
                console.log('Thanks for sharing!');
            }).catch(console.error);
        } else {
            console.error('Web Share API not supported')
        }
    };

    const getNftMetaData = async (tokenId: number) => {
        const settings = {
            apiKey: "L2vtx4tW7tXeREsqVqRUs-OjaSilNFWn", // FIXME: ENV
            network: Network.MATIC_MUMBAI // FIXME: ENV controlled network
        };

        const alchemy = new Alchemy(settings);

        const response = await alchemy.nft.getNftMetadata(
            PUBLIC_CONTRACT_ADDRESS,
            tokenId.toString()
        );

        console.log(`getNftMetaData response`, response)

        if (response?.media?.length > 0) {
            imageData.set(response.media[0].raw)
            nftTitle.set(response.title)
            nftDescription.set(response.description)
            nftAlt.set('FIXME: ALT TEXT')
            loading.set(false)
        }
    }

    const showWallet = async () => {
        const magic = magicFactory()

        magic.wallet.showUI()
    }

    getNftMetaData($tokenId)
    console.log($page)
</script>

<svelte:head>
    <!-- TODO: set canonical URL (decide trailing slash etc) -->
    <meta property="og:url" content={$page.url}/>
    <meta property="og:title" content="{$nftTitle}"/>
    <meta property="og:image" content="{$imageData}"/>
    <meta property="og:image:alt" content="{$nftAlt}"/>
    <meta property="og:description" content="{$nftDescription}"/>
</svelte:head>

{#if !$loading}
<h1>{$nftTitle}</h1>

<div style="z-index: 999; text-align: center;">
    <img alt="FIXME: ALT ATTRIBUTE!" src="{$imageData}"/>

    <ul style="text-align: left;">
        <li>You can <a
            href="{generateOpenSeaURL($tokenId)}"
            target="_blank">view your choodle on OpenSea</a>
        </li>
    <li><button on:click={share}>Share</button></li>
    <li><button on:click={choodleAgain}>Choodle again</button></li>
    <li><button on:click={showWallet}>Show Wallet</button></li>
    </ul>
</div>
{:else}
    <LoadingIndicator />
{/if}

