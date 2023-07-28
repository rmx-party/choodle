<script>
    import {goto} from "$app/navigation";
    import {page} from "$app/stores";
    import opengraphChoodle from "$lib/assets/OpenGraph-Choodle-630x630-2x.png";
    import Button from "../components/Button.svelte";
    import handDraw from "$lib/assets/hand-draw.svg"
    import MetaData from "../components/MetaData.svelte";
    import Wordmark from "../components/Wordmark.svelte";
</script>
<MetaData url={$page.url}
          title="Welcome!"
          imageUrl={opengraphChoodle}
          width="630"
          height="630"
          description="Draw something that lasts forever. Express yourself with lo-fi doodles that are yours to keep, sell, or share."/>

<h1>Welcome to
    <br/>
    <Wordmark fontSize='4rem'/>
    <br/>
    (prototype)
</h1>
<Button variant="primary" on:click={() => goto('/howto')} icon={handDraw}>Let's Draw!</Button>

<style>
    :root {
        text-align: center;
    }

    h1 {
        line-height: 3em;
        font-size: 2rem;
    }
</style>


