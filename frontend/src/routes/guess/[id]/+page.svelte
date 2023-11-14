<script lang="ts">
  import { urlFor } from '$lib/PersistedImagesUtils'
  import { share, type Shareable } from '$lib/ShareUtils'
  import { writable } from 'svelte/store'
  import GuessingHUD from '../../../components/GuessingHUD.svelte'
  import Button from '../../../components/Button.svelte'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import MetaData from '../../../components/MetaData.svelte'
  import { onMount } from 'svelte'
  import { getDeviceId, locateCreator } from '$lib/CreatorUtils'
  import { browser } from '$app/environment'
  import filter from 'lodash/fp/filter'
  import find from 'lodash/fp/find'
  import isEmpty from 'lodash/fp/isEmpty'
  import GuessingInterface from '../../../components/GuessingInterface.svelte'
  import { toHTML } from '@portabletext/to-html'
  import { choodleYellow, pageBackgroundDefault } from '$lib/Configuration'
  import LayoutContainer from '../../../components/LayoutContainer.svelte'
  import ChoodleContainer from '../../../components/ChoodleContainer.svelte'
  import { readOnlyClient, readWriteClient } from '$lib/CMSUtils'
  import Hints from '../../../components/Hints.svelte'
  import { closeDialog, loading, loadingMessage, openDialog } from '$lib/store'
  import Dialog from '../../../components/Dialog.svelte'
  import localforage from 'localforage'
  import {
    isGameComplete,
    isNormalizedGameComplete,
    isPlayerInGame,
    normalizeGame,
    type StreakGuessingGame,
    type StreakGuessingGameChallenge,
    type StreakGuessingGameDrawing,
    type StreakGuessingGameGuessResult,
    type StreakGuessingGamePlayer,
  } from '$lib/CWFGame'
  import type { PageData } from './$types'
  import TextMessageBubble from '../../../components/TextMessageBubble.svelte'
  import { pickPath, sharePath } from '$lib/routes'

  loading.set(true)
  loadingMessage.set('loading')

  export let data: PageData
  const currentGuess = writable([])
  const cursorLocation = writable(0)

  // TODO: CMS manageed
  let guessesRemaining = 3
  let guessesLimit = 3

  let choodleOwner = false
  let success = false
  let stillGuessing: boolean
  $: stillGuessing = !success && guessesRemaining > 0

  let deviceId: string | undefined
  let username = ''
  let guesser: StreakGuessingGamePlayer
  let guess: StreakGuessingGameGuessResult
  let game: StreakGuessingGame
  let disableKeyboard = false

  let hints: { text: string; used: boolean }[] = []
  $: {
    hints = filter(
      (hint) => !!hint.text,
      [
        { text: data.gamePrompt?.hint, used: hintUsedInGuess(guess, data.gamePrompt?.hint) },
        { text: data.gamePrompt?.hint_2, used: hintUsedInGuess(guess, data.gamePrompt?.hint_2) },
        { text: data.gamePrompt?.hint_3, used: hintUsedInGuess(guess, data.gamePrompt?.hint_3) },
      ]
    )
  }

  const challengeHasBeenGuessed = (
    game: StreakGuessingGame,
    challenge: StreakGuessingGameChallenge
  ) => {
    return isEmpty(
      filter((guessResult) => guessResult.challenge._id === challenge._id, game.guessResults)
    )
  }

  const locateGame = async ({ challengerId, guesserId, guessId }) => {
    const query = `*[_type == "cwfgame"][(player1._ref match "${challengerId}" && player2._ref match "${guesserId}") || (player1._ref match "${guesserId}" && player2._ref match "${challengerId}")]{..., guessResults[]->{...}, player1->{...}, player2->{...}, challenge->{...}}`
    let locatedGames = await readOnlyClient.fetch(query)
    // Find the located game that has the guess we're looking for, or the challenge.
    let locatedGame = find(
      (game) =>
        find((guessResult) => guessResult._id === guessId, game.guessResults) ||
        game.currentChallenge?._ref === data.challenge._id,
      locatedGames
    )
    console.log({ locatedGame })
    if (locatedGame && challengeHasBeenGuessed(locatedGame, data.challenge)) {
      console.log(
        'this challenge has already been guessed within this game, do not create or update the game'
      )
      return locatedGame
    }
    if (!locatedGame || isNormalizedGameComplete([...normalizeGame(locatedGame).guessResults])) {
      console.log('create')
      locatedGame = await readWriteClient.create(
        {
          _type: 'cwfgame',
          player1: { _ref: challengerId },
          player2: { _ref: guesserId },
          currentChallenge: { _ref: data.challenge._id },
        },
        { autoGenerateArrayKeys: true }
      )
    } else {
      console.log('update')
      console.log({ game: locatedGame })
      const patch = readWriteClient.patch(locatedGame._id)
      if (
        locatedGame.guessResults
          .map((gr: StreakGuessingGameGuessResult) => gr._id)
          .includes(guess._id)
      ) {
        console.log('we already have this guess')
      } else {
        console.log('adding a guessResult')
        patch.append('guessResults', [{ _ref: guessId }])
      }
      patch.commit({ autoGenerateArrayKeys: true })
    }

    return locatedGame
  }

  export const locateGuess = async ({
    guesserId,
    challengeId,
  }: {
    guesserId: string | undefined
    challengeId: string | undefined
  }) => {
    console.log('locateGuess')
    const query = `*[_type == "guess"][guesser._ref match "${guesserId}" && challenge._ref match "${challengeId}"]`
    let guess = (await readOnlyClient.fetch(query))[0]
    console.log(guess)
    if (!guess) {
      console.log('create a new guess')
      guess = await readWriteClient.create(
        {
          _type: 'guess',
          guesser: { _ref: guesserId },
          challenge: { _ref: data.challenge._id },
        },
        { autoGenerateArrayKeys: true }
      )
    }
    console.log('returning that guess')
    return guess
  }

  const isCorrect = (guess: StreakGuessingGameGuessResult, answer: string): boolean => {
    return guess.join('').toUpperCase() === answer.toUpperCase()
  }

  const createGuess = async (guessedCorrectly: boolean | null) => {
    console.log(`adding guess, resolving result to`, guessedCorrectly)
    const guessResult = readWriteClient
      .patch(guess._id)
      .setIfMissing({ guesses: [] })
      .append('guesses', [$currentGuess.join('')])

    if (guessedCorrectly !== null) {
      guessResult.set({ guessedCorrectly })
    }
    guess = await guessResult.commit({ autoGenerateArrayKeys: true })
    guessesRemaining = guessesLimit - (guess?.guesses?.length || 0)
    console.log({ guess })

    if (guessedCorrectly !== null) {
      console.log('guess completed, adding to game')
      game = {
        ...game,
        guessResults: [...(game.guessResults || []), guess],
      }
      game = await readWriteClient
        .patch(game._id)
        .setIfMissing({ guessResults: [] })
        .append('guessResults', [{ _ref: guess._id }])
        .commit({ autoGenerateArrayKeys: true })
    }
  }

  const handleCorrectGuess = () => {
    console.log(`right answer, you won the thing`)
    success = true

    if (usernameRequired && !username.length) {
      promptForAndSetUsername()
      return
    }

    createGuess(true)
    guessesRemaining--
    cursorLocation.set(-1)
  }

  const handleIncorrectGuess = () => {
    console.log(`wrong`)

    if (guessesRemaining <= 1) {
      if (usernameRequired && !username.length) {
        console.log(`prompting for username`)
        promptForAndSetUsername()
        return
      }
      console.log(`creating final guess`)
      createGuess(false)
    } else {
      console.log(`creating non-final guess, ${guessesRemaining} guesses left`)
      createGuess(null)
    }

    guessesRemaining--
    currentGuess.set([])
    cursorLocation.set(0)
  }

  const submitGuess = () => {
    if (username.length < 1) {
      openDialog(usernamePromptId)
      return
    }

    if ($currentGuess?.length < data.gamePrompt?.prompt?.length) return

    console.log(`checking answer, ${guessesRemaining} guesses left`)

    isCorrect($currentGuess, data.gamePrompt?.prompt)
      ? handleCorrectGuess()
      : handleIncorrectGuess()
  }

  const afterHint = async ({ text }: { text: string }) => {
    if (hintUsedInGuess(guess, text)) {
      console.log(`hint already used ${text}`)
      return
    }

    console.log(`adding ${text} to the used hints on ${guess._id}`)

    guess = await readWriteClient
      .patch(guess._id)
      .setIfMissing({ hintsUsed: [] })
      .append('hintsUsed', [text])
      .commit()
  }

  const hintUsedInGuess = (guess: StreakGuessingGameGuessResult, hintText: string) => {
    console.log(`hintUsedInGuess, ${guess?._id}, ${hintText}`)
    if (!guess?.hintsUsed) {
      console.log('no hints used')
      return false
    }

    return guess.hintsUsed.includes(hintText)
  }

  const usernamePromptId = 'username-prompt'

  // TODO: switch back for username driven gameplay after prod deploy
  const usernameRequired = true
  const promptForAndSetUsername = async () => {
    console.log('prompting for username')
    if (!browser) return

    if (username.length > 0) {
      console.log('there was a username, closing the dialog')
      disableKeyboard = false
      closeDialog(usernamePromptId)
      guesser = await locateCreator({ username, deviceId })
      submitGuess()
      return
    }

    console.log('disable keyboard and open username dialog')
    disableKeyboard = true
    openDialog(usernamePromptId)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const attemptToSubmitGuess = async (_event?: Event) => {
    if (!browser) return
    if ($currentGuess.length !== data.challenge?.gamePrompt?.prompt?.length) return

    submitGuess()
    return
  }

  onMount(async () => {
    deviceId = await getDeviceId()
    guesser = await locateCreator({ deviceId })

    console.log({ challenge: data.challenge })
    choodleOwner = data.challenge.challenger._id === guesser._id // TODO: this is based on device+choodle, should be by creator account

    console.log({ choodleOwner })

    if (choodleOwner) {
      goto(sharePath(data.challenge._id))
      return
    }

    guess = await locateGuess({ guesserId: guesser._id, challengeId: data.challenge._id })
    guessesRemaining = guessesLimit - (guess?.guesses?.length || 0)
    if (guess.guessedCorrectly) {
      success = true
    }

    game = await locateGame({
      challengerId: data.challenge.challenger._id,
      guesserId: guesser._id,
      guessId: guess._id,
    })
    console.log({ game })

    loading.set(false)
  })

  const bestImageUrl = (choodle: StreakGuessingGameDrawing) => {
    let bestImage = choodle.upScaledImage

    if (!bestImage) {
      bestImage = choodle.image
    }

    return urlFor(bestImage).url()
  }

  const shareTextNthTryCopy = (nthTry: number) => {
    switch (nthTry) {
      case 1:
        return `1st`
      case 2:
        return `2nd`
      case 3:
        return `3rd`
      default:
        return `${nthTry}th`
    }
  }
  const shareTextNthGuessCopy = (guess: string, n: number) => {
    switch (n) {
      case 0:
        return `1️⃣ ${guess}`
      case 1:
        return `2️⃣ ${guess}`
      case 2:
        return `3️⃣ ${guess}`
      default:
        return guess
    }
  }
  let shareTextSuccessMessage = ``
  $: {
    shareTextSuccessMessage = `🏆 I guessed right on the ${shareTextNthTryCopy(
      guessesLimit - guessesRemaining
    )} try!`
  }
  let shareTextFailureMessage = ``
  $: shareTextFailureMessage = `🫣 I couldn’t guess ${data.gamePrompt?.prompt}!`
  let shareTextGuesses = ``
  $: shareTextGuesses = (guess?.guesses || []).map(shareTextNthGuessCopy).join(`\n`)

  let shareTextStats = ``
  $: {
    shareTextStats = `🛟 ${guess?.hintsUsed?.length || 0}`
    //🔥 ${streakCount(game)}`;
  }
  let newLine = `\n`

  let shareable: Shareable
  $: {
    let shareCopy = success ? shareTextSuccessMessage : shareTextFailureMessage
    let text = [
      shareCopy,
      newLine,
      newLine,
      shareTextGuesses,
      newLine,
      newLine,
      shareTextStats,
    ].join(``)
    shareable = { text }
  }

  let copiedToClipboard = false

  function handleShare(event: MouseEvent): void {
    event.preventDefault()
    if (!browser) return

    share(shareable, (usedClipboard: boolean) => {
      copiedToClipboard = usedClipboard
    })
  }
</script>

<MetaData
  url={$page.url}
  title={data.copy.defaultPageTitle}
  imageUrl={bestImageUrl(data.choodle)}
  width="430"
  height="932"
  themeColor={choodleYellow}
  bgColor={pageBackgroundDefault}
/>

{#if stillGuessing}
  <LayoutContainer class="no-pan">
    <div class="topBar" slot="topBar">
      <GuessingHUD {guessesRemaining} {guessesLimit}>
        <div slot="content">
          {@html toHTML(data.copy.guess_pageTopContent)}
        </div>
      </GuessingHUD>
    </div>

    <ChoodleContainer --choodle-max-height-offset="31.5rem">
      <img src={bestImageUrl(data.choodle)} alt="" />
    </ChoodleContainer>

    {#if guessesRemaining < guessesLimit && data.copy.guess_incorrectFeedbackText}
      <p class="failure">{data.copy.guess_incorrectFeedbackText}</p>
    {:else}
      <p><!-- layout placeholder --></p>
    {/if}
    <GuessingInterface
      format={data.gamePrompt?.prompt.split('')}
      inputDisplay={currentGuess}
      {cursorLocation}
      onEnter={attemptToSubmitGuess}
      {disableKeyboard}
    >
      <div slot="between">
        <Hints {hints} hintCta={data.copy.guess_needHintCtaText} {afterHint} />
      </div>
    </GuessingInterface>
  </LayoutContainer>
{:else}
  <LayoutContainer class="no-pan">
    <section class="top-content">
      {#if success}
        {@html toHTML(data.copy.guess_pageTopContentSuccess)}
      {:else}
        {@html toHTML(data.copy.guess_pageTopContentFailure)}
      {/if}
    </section>

    <TextMessageBubble>{shareable.text}</TextMessageBubble>

    {#if success}
      <Button variant="primary" colour="yellow" on:click={handleShare}
        >{copiedToClipboard
          ? data.copy.guess_copiedToClipboard
          : data.copy.guess_shareButtonTextSuccess}</Button
      >
    {:else if guessesRemaining < 1}
      <Button variant="primary" colour="yellow" on:click={handleShare}
        >{copiedToClipboard
          ? data.copy.guess_copiedToClipboard
          : data.copy.guess_shareButtonTextFailure}</Button
      >
    {/if}
  </LayoutContainer>
{/if}

<Dialog id={usernamePromptId} onClose={submitGuess}>
  <header slot="header">{data.copy.draw_usernameHeader}</header>
  <div>{data.copy.draw_usernameInstructions}</div>
  <label
    for="creator-username"
    style="text-align: left; display: block; font-family: Dejavu Sans Bold;"
    >username
    <br />
    <input
      bind:value={username}
      type="username"
      id="creator-username"
      name="creatorusername"
      placeholder={data.copy.draw_usernamePlaceholder}
      style="width: 100%; padding: 1rem 0.5rem; border-radius: 0.25rem; margin: 0.5rem 0;"
    />
  </label>
  <Button on:click={promptForAndSetUsername} variant="primary" colour="yellow">
    {data.copy.draw_usernameSaveButtonText}
  </Button>
</Dialog>

<style>
  .topBar {
    width: 100%;
  }

  .top-content {
    margin: 3rem 0;
  }

  .failure {
    color: red;
  }

  [slot='between'] {
    width: 100%;
  }
</style>
