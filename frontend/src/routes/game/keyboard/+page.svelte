<script lang="ts">
  import Keyboard from "../../../components/Keyboard.svelte";
  import GuessInput from "../../../components/GuessInput.svelte";
  import {writable} from "svelte/store";

  let inputDisplay = writable('');
  let format = "FOO BAR";

  const handleKeyPress = (keyPress: string) => {
    inputDisplay.set('hello')
  }
</script>

<Keyboard onKeyPress={handleKeyPress}/>
<GuessInput format={format} display={$inputDisplay}/>
