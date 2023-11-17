<script lang="ts">
  import { urlFor } from '$lib/PersistedImagesUtils'
  import { share, type Shareable } from '$lib/ShareUtils'
  import { writable, type Writable } from 'svelte/store'
  import GuessingHUD from '../../../components/GuessingHUD.svelte'
  import Button from '../../../components/Button.svelte'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import MetaData from '../../../components/MetaData.svelte'
  import { getContext, onMount } from 'svelte'
  import { browser } from '$app/environment'
  import filter from 'lodash/fp/filter'
  import GuessingInterface from '../../../components/GuessingInterface.svelte'
  import { toHTML } from '@portabletext/to-html'
  import { choodleYellow, pageBackgroundDefault } from '$lib/Configuration'
  import LayoutContainer from '../../../components/LayoutContainer.svelte'
  import ChoodleContainer from '../../../components/ChoodleContainer.svelte'
  import { readOnlyClient, readWriteClient } from '$lib/CMSUtils'
  import Hints from '../../../components/Hints.svelte'
  import { closeDialog, loading, openDialog, uncaughtErrors } from '$lib/store'
  import type {
    StreakGuessingGameDrawing,
    StreakGuessingGameGuessResult,
    StreakGuessingGamePlayer,
  } from '$lib/CWFGame'
  import type { PageData } from './$types'
  import TextMessageBubble from '../../../components/TextMessageBubble.svelte'
  import { sharePath } from '$lib/routes'
  import uniq from 'lodash/fp/uniq'
  import UserNameModal from '../../../components/UserNameModal.svelte'

  loading.set(true)

  const guesser: Writable<StreakGuessingGamePlayer> = getContext('choodler')
  $: console.log(`guess page react`, { guesser: $guesser })

  export let data: PageData
  const currentGuess = writable([])
  const cursorLocation = writable(0)

  // TODO: CMS manageed
  const guessesLimit = 3
  let guessesRemaining = 3
  $: guessesRemaining = guessesLimit - (guess?.guesses?.length || 0)

  let choodleOwner = false
  $: choodleOwner = data.challenge.challenger._id === $guesser?._id
  $: {
    if (browser && choodleOwner) {
      goto(sharePath(data.challenge._id))
    }
  }

  $: success = !!guess?.guessedCorrectly

  let stillGuessing: boolean = false
  $: stillGuessing = !success && guessesRemaining > 0

  let guess: StreakGuessingGameGuessResult
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

  let alreadyLookingForGuess = false
  export const locateGuess = async ({
    guesserId,
    challengeId,
  }: {
    guesserId: string | undefined
    challengeId: string | undefined
  }) => {
    if (alreadyLookingForGuess || !guesserId || !challengeId || choodleOwner) return
    console.log('locateGuess', { guesserId, challengeId })
    $loading || loading.set(true)
    alreadyLookingForGuess = true
    const query = `*[_type == "guess"][guesser._ref match "${guesserId}" && challenge._ref match "${challengeId}"][0]`
    guess = await readOnlyClient.fetch(query)
    console.log(`locateGuess GET`, { guess })
    if (!guess?._id) {
      console.log('no guess found, creating a new guess')
      guess = await readWriteClient.create(
        {
          _type: 'guess',
          guesser: { _ref: guesserId },
          challenge: { _ref: data.challenge._id },
          guesses: [],
          hintsUsed: [],
        },
        { autoGenerateArrayKeys: true }
      )
    }
    loading.set(false)
    if (!guess) throw new Error(`no guess could be found or created`)
    console.log(`locateGuess result`, { guess })
    alreadyLookingForGuess = false
  }

  const isCorrect = (guess: string[], answer: string): boolean => {
    return guess.join('').toUpperCase() === answer.toUpperCase()
  }

  const createGuess = async (guessedCorrectly: boolean | undefined) => {
    console.log(`adding guess, resolving result to`, guessedCorrectly)

    // Optimistic local update ahead of the network request
    guess = {
      ...guess,
      guesses: [...(guess.guesses || []), $currentGuess.join('')],
      guessedCorrectly,
    }

    const guessResult = readWriteClient
      .patch(guess._id)
      .setIfMissing({ guesses: [] })
      .append('guesses', [$currentGuess.join('')])

    if (guessedCorrectly !== null) {
      guessResult.set({ guessedCorrectly })
    }
    guess = await guessResult.commit({ autoGenerateArrayKeys: true })
    console.log({ guess })
  }

  const handleCorrectGuess = () => {
    console.log(`right answer, you won the thing`)

    if (usernameRequired && !username?.length) {
      promptForAndSetUsername()
      return
    }

    success = true
    createGuess(true)
    guessesRemaining--
    cursorLocation.set(-1)
  }

  const handleIncorrectGuess = () => {
    console.log(`wrong`)

    if (guessesRemaining <= 1) {
      if (usernameRequired && !username?.length) {
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
    if (1 > username?.length) {
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
      console.log(`hint already used: \n${text}`)
      return
    }

    console.log(`adding ${text} to the used hints on ${guess._id}`)
    guess = { ...guess, hintsUsed: [...(guess.hintsUsed || []), text] }
    guess = await readWriteClient
      .patch(guess._id)
      .setIfMissing({ hintsUsed: [] })
      .append('hintsUsed', [text])
      .commit()
  }

  const hintUsedInGuess = (guess: StreakGuessingGameGuessResult, hintText: string) => {
    if (!guess) return true // Block hint reveals until a guessResult entity is loaded
    if (!guess?.hintsUsed) {
      return false
    }

    return guess.hintsUsed.includes(hintText)
  }

  const usernamePromptId = 'username-prompt'

  const usernameRequired = true
  const promptForAndSetUsername = async () => {
    console.log('prompting for username')
    if (!browser) return

    if (username?.length > 0) {
      console.log('there was a username, closing the dialog')
      disableKeyboard = false
      closeDialog(usernamePromptId)
      await readWriteClient.patch($guesser._id).set({ username }).commit()
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

  let username: string | undefined
  $: {
    if ($guesser?.username?.length) {
      // Assign this once when the user loads, don't fight with the input binding
      username = $guesser.username
    }
  }

  $: {
    if (!guess && $guesser?._id && data.challenge?._id && !choodleOwner) {
      loading.set(true)
      locateGuess({ guesserId: $guesser._id, challengeId: data.challenge._id }).catch((error) => {
        uncaughtErrors.set([...$uncaughtErrors, { error }])
      })
    }
  }

  onMount(async () => {
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
  $: shareTextFailureMessage = `🫣 I couldn’t guess ${data.gamePrompt?.prompt}!`
  $: shareTextGuesses = (guess?.guesses || []).map(shareTextNthGuessCopy).join(`\n`)
  let shareTextStats = ``
  $: {
    shareTextStats = `🛟 ${uniq(guess?.hintsUsed || []).length}`
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

{#if guess && stillGuessing}
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
{:else if guess}
  <LayoutContainer class="no-pan">
    {#if success}
      <section class="top-content">
        {@html toHTML(data.copy.guess_pageTopContentSuccess)}
      </section>

      <TextMessageBubble>{shareable.text}</TextMessageBubble>

      <Button variant="primary" colour="yellow" on:click={handleShare}
        >{copiedToClipboard
          ? data.copy.guess_copiedToClipboard
          : data.copy.guess_shareButtonTextSuccess}</Button
      >
    {:else}
      <section class="top-content">
        {@html toHTML(data.copy.guess_pageTopContentFailure)}
      </section>

      <TextMessageBubble>{shareable.text}</TextMessageBubble>

      <Button variant="primary" colour="yellow" on:click={handleShare}
        >{copiedToClipboard
          ? data.copy.guess_copiedToClipboard
          : data.copy.guess_shareButtonTextFailure}</Button
      >
    {/if}
  </LayoutContainer>
{/if}

<UserNameModal
  headerContent={data.copy.draw_usernameHeader}
  placeholderContent={data.copy.draw_usernamePlaceholder}
  saveButtonText={data.copy.draw_usernameSaveButtonText}
  bind:usernameValue={username}
  onClick={promptForAndSetUsername}
/>

<style>
  .topBar {
    width: 100%;
  }

  .top-content {
    margin: 3rem 0;
  }

  .failure {
    color: var(--choodle-red);
  }

  [slot='between'] {
    width: 100%;
  }
</style>
