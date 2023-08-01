<svelte:head>
    <meta name="viewport"
          content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, initial-scale=1.0, user-scalable=no">
</svelte:head>

<div id="container">
    <div id="draw">
        <slot/>
    </div>
</div>

<style>
    #container {
        background: white;
        text-align: center;
    }
</style>
