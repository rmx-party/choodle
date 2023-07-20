<script lang="ts">
    export let variant = 'secondary';
</script>

<div class={`btn ${variant}`}>
    <slot />
</div>

<style>
.btn {
    flex-grow: 1;
    height: 3.5em; 
    padding: 8px; 
    box-shadow: 0px 0.3em 1.5em rgba(0, 0, 0, 0.1); 
    border-radius: 24px;
    backdrop-filter: blur(80px); 
    justify-content: center;
    align-items: center; 
    display: inline-flex;
    color: #141518; 
    font-size: 18px; 
    font-family: var(--app-main-font-family); 
    font-weight: 400; 
    line-height: 21.60px; 
    letter-spacing: 0.18px; 
    word-wrap: break-word
}
.secondary {
    background: white; 
    border: 0.50px white solid; 
    gap: 16px; 
}
.primary {
    background: var(--color-primary);
    border: 0.50px #FFF506 solid;
    gap: 8px; 
    font-weight: 700;
}
</style>
