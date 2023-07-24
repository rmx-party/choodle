<script lang="ts">
    import wordmark from '$lib/assets/choodle-wordmark-1080.png';

    export let fontSize = 'inherit';
</script>

<img class="wordmark" src={wordmark} alt="Choodle" style:font-size={fontSize} />

<style>
    .wordmark {
        display: inline-block;
        height: 1em;
        image-rendering: pixelated;
        vertical-align: baseline;
    }
</style>
