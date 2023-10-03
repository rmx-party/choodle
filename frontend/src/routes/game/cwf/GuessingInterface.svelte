<script lang="ts">
  import Keyboard from "../../../components/Keyboard.svelte";
  import GuessInput from "../../../components/GuessInput.svelte";
  import {writable} from "svelte/store";

  export let format
  export let inputDisplay = writable([])
  export let cursorLocation = writable(0)
  export let onEnter = () => {
  }


  const moveCursorRightHandlingSpace = () => {
    moveCursorRight()

    if (format[$cursorLocation] === " ") {
      updateAtCursor(' ')
      moveCursorRight()
    }
  }

  const moveCursorLeftHandlingSpace = () => {
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
    if ($cursorLocation > format.length - 1) return;

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

    if (key === "BACKSPACE") {
      moveCursorLeftHandlingSpace()
      updateAtCursor('')
    }

    if (key === "ENTER") {
      onEnter()
    }
  }
</script>

<strong>{format.join('')}</strong>
<br/>

<GuessInput format={format} display={$inputDisplay} cursorLocation={$cursorLocation}/>
<br/>
<Keyboard onKeyPress={handleKeyPress}/>
