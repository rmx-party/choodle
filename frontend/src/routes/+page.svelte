<script>
    import wordmark from '$lib/assets/choodle-wordmark-420.png';
    import {page} from "$app/stores";
    import opengraphChoodle from "$lib/assets/OpenGraph-Choodle-630x630-2x.png";
</script>
<svelte:head>
    <!-- TODO: set canonical URL (decide trailing slash etc) -->
    <meta property="og:type" content='website'/>
    <meta property="og:url" content={$page.url}/>
    <meta property="og:site_name" content="Choodle"/>
    <meta property="og:title" content="Choodle"/>
    <meta property="og:image" content={opengraphChoodle}/>
    <meta property="og:image:secure_url" content={opengraphChoodle}/>
    <meta property="og:image:width" content="630"/>
    <meta property="og:image:height" content="630"/>
    <meta property="og:image:alt" content="Choodle"/>
    <meta property="og:description"
          content="Draw something that lasts forever. Express yourself with lo-fi doodles that are yours to keep, sell, or share."/>
    <meta name="description"
          content="Draw something that lasts forever. Express yourself with lo-fi doodles that are yours to keep, sell, or share."/>
</svelte:head>

<h1>Welcome to
    <br/>
    <img class="wordmark" alt="Choodle" src={wordmark} width="300"/>
    <br/>
    (prototype)
</h1>
<a href="/draw">Let's Play!</a>

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
