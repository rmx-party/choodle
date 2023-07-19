<svelte:head>
    <title>Choodle: Draw</title>
    <meta name="viewport"
          content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, initial-scale=1.0, user-scalable=no">
</svelte:head>

<div id="draw">
    <slot/>
</div>

<style>
:global(body) {
    position: absolute;
    overflow: hidden; /* Avoid scrollbars */
    height: 100vh;
    width: 100vw;
    margin: 0;
    padding: 0;
}

:global(#draw) {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;

    display: flex;
    align-content: center;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;
    flex-wrap: nowrap;
}
</style>
