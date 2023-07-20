
<script>
import wordmark from '$lib/assets/choodle-wordmark-420.png';
</script>
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
