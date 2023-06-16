
<style>
    * {
        box-sizing: border-box;
    }

    body, html {
        margin: 0;
        padding: 0;
        overflow: hidden; /* Avoid scrollbars */
        height: 100%; /* Make sure html and body cover full height */
        width: 100%; /* Make sure html and body cover full width */
    }

    #choodle-board {
        position: absolute; /* Absolute positioning removes any default margins/padding */
        top: 0;
        left: 0;
        z-index: -1000;
    }

    #buttons {
        z-index: 10000;
    }
</style>

<div id="container">
    <div id="drawing-area">
        <canvas id="choodle-board" style="border: 1px red dashed"></canvas>
    </div>
    <div id="buttons">
        <button id="clear-board">Clear</button>
        <button id="undo">Undo</button>
        <button id="save-board">Save</button>
        <button id="load-board">Load</button>
    </div>
</div>
