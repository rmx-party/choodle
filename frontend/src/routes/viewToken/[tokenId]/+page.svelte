<script lang="ts">
    import {page} from "$app/stores";
    import {generateOpenSeaURL} from "$lib/MagicStuff.js";
    import {tokenId} from "$lib/store.js";
    import {clearStorage} from "$lib/CanvasStuff.js";
    import {goto} from "$app/navigation";

    const choodleAgain = async (event: Event) => {
        tokenId.set(null)
        await clearStorage()
        await goto("/")
        window.location.reload()
    }
</script>

<h1>Viewing {$page.params.tokenId}</h1>

<div id="openSeaLink" style="z-index: 999">
    <p>You can view your minted choodle on <a href="{generateOpenSeaURL($page.params.tokenId)}"
                                              target="_blank">OpenSea</a>.
    </p>
    <p><a href="#" on:click={choodleAgain}>Choodle again.</a></p>
</div>
