<script lang="ts">
  import {writable} from 'svelte/store';
  import GuessingInterface from '../../GuessingInterface.svelte';

  let cursorLocation = writable(0);
  let format = 'FOO BAR'.split('');

  const currentGuess = writable([]);
</script>

<strong>{format.join('')}</strong>
<br/>

<GuessingInterface
  {format}
  inputDisplay={currentGuess}
  {cursorLocation}
  onEnter={() => {}}
  reveal={[1, 5]}
></GuessingInterface>
