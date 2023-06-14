<script lang="ts">
    import { browser } from '$app/environment';
    
    /* Configuration */
    const lineWidth = 5;
    
    if (browser) {    
        const canvas: HTMLCanvasElement = document.getElementById('choodle-board')! as HTMLCanvasElement;
        const context = canvas.getContext('2d')!;
        
        const canvasOffsetX = canvas.offsetLeft;
        const canvasOffsetY = canvas.offsetTop;
        
        canvas.width = window.innerWidth - canvasOffsetX;
        canvas.height = window.innerHeight - canvasOffsetY;
        
        let isDrawing = false;
        
        const draw = (e: MouseEvent) => {
            if(!isDrawing) {
                return;
            }
            
            context.lineWidth = lineWidth;
            context.lineCap = 'round';
            
            context.lineTo(e.clientX - canvasOffsetX, e.clientY);
            context.stroke();
        }
        
        canvas.addEventListener('mousedown', e => {
            save()
            isDrawing = true;
        });
        
        canvas.addEventListener('mouseup', e => {
            isDrawing = false;
            context.stroke();
            context.beginPath();
        });
        
        canvas.addEventListener('mousemove', draw);
        
        document.addEventListener('click', e => {
            if (e.target.id === 'clear-board') {
                clear()
            } else if (e.target.id === 'save-board') {
                save()
            } else if (e.target.id === 'load-board') {
                load()
            } else if (e.target.id === 'undo') {
                load()
            }
        });
    }
    
    const clear = () => {
        const canvas: HTMLCanvasElement = document.getElementById('choodle-board')! as HTMLCanvasElement;
        
        canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
    }

    const save = () => {
        const canvas: HTMLCanvasElement = document.getElementById('choodle-board')! as HTMLCanvasElement;

        window.localStorage.setItem("choodle", canvas.toDataURL())
    }

    const load = () => {
        const canvas: HTMLCanvasElement = document.getElementById('choodle-board')! as HTMLCanvasElement;
        const dataURL = window.localStorage.getItem("choodle")

        clear()

        if (dataURL) {
            var image = new Image;
            image.addEventListener('load', () => {
                canvas.getContext('2d')!.drawImage(image, 0, 0);
            });
            image.src = dataURL;
        }
    }
</script>

<canvas style="border: 1px solid red" id="choodle-board"></canvas>

<button id="clear-board">Clear</button>
<button id="undo">Undo</button>
<button id="save-board">Save</button>
<button id="load-board">Load</button>
