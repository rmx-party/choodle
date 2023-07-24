<script>
    import wordmark from '$lib/assets/choodle-wordmark-420.png';
    import {page} from "$app/stores";
    import opengraphChoodle from "$lib/assets/OpenGraph-Choodle-630x630-2x.png";
    import MetaData from "../MetaData.svelte";
</script>
<MetaData url={$page.url}
          title="Welcome!"
          imageUrl={opengraphChoodle}
          width="630"
          height="630"
          description="Draw something that lasts forever. Express yourself with lo-fi doodles that are yours to keep, sell, or share."/>

<h1>Welcome to
    <br/>
    <img class="wordmark" alt="Choodle" src={wordmark} width="300"/>
    <br/>
    (prototype)
</h1>
<a href="/howto">Let's Draw!</a>

<style>
    :root {
        text-align: center;
    }

    h1 {
        line-height: 3em;
    }

    h1 .wordmark {
        display: inline-block;
        font-size: 4rem;
        image-rendering: pixelated;
    }
</style>
