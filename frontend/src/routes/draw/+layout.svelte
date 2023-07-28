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
        position: absolute;
        overflow: hidden; /* Avoid scrollbars */
        margin: 0;
        padding: 0;
        width: 100vw;
        height: 100vh;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }

    #draw {
        height: 100vh;
        height: -webkit-fill-available;
        width: 100vw;
        overflow: hidden; /* Avoid scrollbars */
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
