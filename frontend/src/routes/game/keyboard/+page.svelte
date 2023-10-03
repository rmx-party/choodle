<script lang="ts">
  import Keyboard from "../../../components/Keyboard.svelte";
  import GuessInput from "../../../components/GuessInput.svelte";
  import {writable} from "svelte/store";

  let inputDisplay = writable([])
  let cursorLocation = writable(0)
  let format = "FOO BAR".split('')

  const moveCursorRightHandlingSpace = () => {
    moveCursorRight()

    if (format[$cursorLocation] === " ") {
      updateAtCursor(' ')
      moveCursorRight()
    }
  }

  const moveCursorLeftHandlingspace = () => {
    moveCursorLeft()

    if (format[$cursorLocation] === " ") {
      updateAtCursor(' ')
      moveCursorLeft()
    }
  }

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
      moveCursorRightHandlingSpace()
    }
    // handle spaces

    if (key === "BACKSPACE") {
      moveCursorLeftHandlingspace()
      updateAtCursor('')
    }

    console.log($inputDisplay.join(''))
  }
</script>

<strong>{format.join('')}</strong>
<br/>

<GuessInput format={format} display={$inputDisplay} cursorLocation={$cursorLocation}/>
<br/>
<Keyboard onKeyPress={handleKeyPress}/>
