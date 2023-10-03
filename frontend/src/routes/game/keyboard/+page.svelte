<script lang="ts">
  import Keyboard from "../../../components/Keyboard.svelte";
  import GuessInput from "../../../components/GuessInput.svelte";
  import {writable} from "svelte/store";

  let inputDisplay = writable([])
  let cursorLocation = writable(0)
  let format = "FOOBAR".split('')

  const moveCursorRight = () => {
    if ($cursorLocation === format.length) return;

    cursorLocation.update(currentCursorLocation => currentCursorLocation + 1)
  }

  const moveCursorLeft = () => {
    if ($cursorLocation < 1) {
      cursorLocation.set(0)
      return;
    }
    cursorLocation.update(currentCursorLocation => currentCursorLocation - 1)
  }

  const updateAtCursor = (key) => {
    inputDisplay.update(currentInputDisplay => {
      currentInputDisplay[$cursorLocation] = key
      return currentInputDisplay
    })
  }

  const handleKeyPress = (key: string) => {
    if (key !== "BACKSPACE" && key !== "ENTER") {
      updateAtCursor(key)
      moveCursorRight()
    }
    // handle spaces

    if (key === "BACKSPACE") {
      moveCursorLeft()
      updateAtCursor('')
    }
  }
</script>

<GuessInput format={format} display={$inputDisplay} cursorLocation={$cursorLocation}/>
<br/>
<Keyboard onKeyPress={handleKeyPress}/>
