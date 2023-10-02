<script lang="ts">
  const keyRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['<', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '>'],
  ]
</script>

<div class="keyboard">
  {#each keyRows as row}
    <div class="keyboardRow">
      {#each row as key}
        <div class="keyboardKey">{key}</div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .keyboard {
    display: flex;
    flex-direction: column;
  }

  .keyboardRow {
    display: flex;
    flex-direction: row;
  }

  .keyboardKey {
    text-align: center;
    background: white;
    border-radius: 0.25rem;
    width: 2rem;
    padding: 0.5rem;
    margin: 0.1rem;
  }
</style>
