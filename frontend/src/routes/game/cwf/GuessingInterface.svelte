<script lang="ts">
  import Keyboard from "../../../components/Keyboard.svelte";
  import GuessInput from "../../../components/GuessInput.svelte";
  import {writable} from "svelte/store";

  export let format: string[] = []
  export let inputDisplay = writable([])
  export let cursorLocation = writable(0)
  export let onEnter = () => { return }

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

  const updateAtCursor = (key: string) => {
    if ($cursorLocation > format.length - 1) return;

    inputDisplay.update(currentInputDisplay => {
      const newInput = [...currentInputDisplay]
      newInput[$cursorLocation] = key
      return newInput
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

<GuessInput format={format} display={$inputDisplay} cursorLocation={$cursorLocation}/>

<slot name="between" />

<Keyboard onKeyPress={handleKeyPress}/>
