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
                const canvas: HTMLCanvasElement = document.getElementById('choodle-board')! as HTMLCanvasElement;
                const context = canvas.getContext('2d')!;
                
                context.clearRect(0, 0, canvas.width, canvas.height);
            }
        });
    }
    
    const clear = () => {
        const canvas: HTMLCanvasElement = document.getElementById('choodle-board')! as HTMLCanvasElement;
        const context = canvas.getContext('2d')!;
        
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
    
</script>

<canvas style="border: 1px solid red" id="choodle-board" />

<button id="clear-board">Clear</button>