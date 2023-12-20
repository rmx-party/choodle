<script lang="ts">
  import overlayImage from '$lib/assets/overlay-hand-draw.svg'
  import { fade } from 'svelte/transition'

  export let instructionText = 'default instruction'
</script>

<div class="overlay" out:fade={{ duration: 200 }}>
  <h2 class="instruction">{instructionText}</h2>
  <img height="243" width="164" src={overlayImage} alt="grey hand pointing" />
</div>

<style>
  .overlay {
    pointer-events: none;
    position: absolute;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .instruction {
    display: flex;
    padding: 8px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    border-radius: 4px;
    background: rgba(52, 52, 52, 0.8);
    box-shadow: 1px 1px 32px 0px rgba(0, 0, 0, 0.12);
    backdrop-filter: blur(75px);

    color: var(--choodle-white, #fff);

    /* mobile/h2 */
    font-family: DejaVu Sans;
    font-size: 32px;
    font-style: normal;
    font-weight: 400;
    line-height: 120%; /* 38.4px */
    letter-spacing: 0.064px;
  }
</style>
