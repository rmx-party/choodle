<script lang="ts">
    import wordmark from '$lib/assets/choodle-wordmark.png';
    import wordmark140 from '$lib/assets/choodle-wordmark-140.png';
    import wordmark420 from '$lib/assets/choodle-wordmark-420.png';
    import wordmark1080 from '$lib/assets/choodle-wordmark-1080.png';
    import wordmark1920 from '$lib/assets/choodle-wordmark-1920.png';

    export let fontSize = 'inherit';
</script>

<img class="wordmark" src={wordmark} alt="Choodle" style:font-size={fontSize}
    srcset={`${wordmark} 88w, ${wordmark140} 140w, ${wordmark420} 420w, ${wordmark1080} 1080w, ${wordmark1920} 1920w`}/>

<style>
    .wordmark {
        display: inline-block;
        height: 1em;
        image-rendering: pixelated;
        vertical-align: baseline;
        margin: 0 auto;
    }
</style>
