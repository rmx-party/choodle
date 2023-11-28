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
  import { loading, uncaughtErrors } from '$lib/store'
  import type {
    StreakGuessingGameDrawing,
    StreakGuessingGameGuessResult,
    StreakGuessingGamePlayer,
  } from '$lib/CWFGame'
  import type { PageData } from './$types'
  import TextMessageBubble from '../../../components/TextMessageBubble.svelte'
  import { sharePath } from '$lib/routes'
  import uniq from 'lodash/fp/uniq'
  import JSConfetti from 'js-confetti'

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
  $: choodleOwner = data.challenge?.challenger?._id === $guesser?._id
  $: {
    if (browser && choodleOwner) {
      goto(sharePath(data.challenge._id))
    }
  }

  $: success = !!guess?.guessedCorrectly
  let stillGuessing: boolean = false
  $: stillGuessing = !success && guessesRemaining > 0

  let jsConfetti: JSConfetti
  const successConfettiConfig = {
    emojis: ['🎉', '🎊', '🏆', '🌟', '🦵', '🧚', '💯', '🤩'],
    confettiNumber: 80,
    emojiSize: 130,
  }
  const failureConfettiConfig = {
    emojis: ['💀', '💢', '🪑', '⌨️ ', '😭', '💧', '⚔️', '🚫', '🦞'],
    confettiNumber: 30,
    emojiSize: 100,
  }
  const confettiConfigs = {
    success: successConfettiConfig,
    failure: failureConfettiConfig,
  }
  const reducedMotionPreference = () => {
    if (!browser) return
    const reduceMotion = !!(
      window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
      window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true
    )
    console.log({ reduceMotion })
    return reduceMotion
  }
  const celebrate = (occasion: string) => {
    if (!browser) return
    if (reducedMotionPreference()) return

    jsConfetti.addConfetti(confettiConfigs[occasion])
  }
  $: success && celebrate('success')
  // $: !success && !stillGuessing && celebrate('failure')

  let guess: StreakGuessingGameGuessResult
  let disableKeyboard = false

  let hints: { text: string; used: boolean }[] = []
  $: {
    hints = filter(
      (hint) => !!hint.text,
      [
        {
          text: data.challenge?.gamePrompt?.hint,
          used: hintUsedInGuess(guess, data.challenge?.gamePrompt?.hint),
        },
        {
          text: data.challenge?.gamePrompt?.hint_2,
          used: hintUsedInGuess(guess, data.challenge?.gamePrompt?.hint_2),
        },
        {
          text: data.challenge?.gamePrompt?.hint_3,
          used: hintUsedInGuess(guess, data.challenge?.gamePrompt?.hint_3),
        },
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

    const query = `*[_type == "guess"][guesser._ref == $guesserId && challenge._ref == $challengeId][0]`
    guess = await readOnlyClient.fetch(query, { guesserId, challengeId }).catch((error) => {
      uncaughtErrors.set([...$uncaughtErrors, { error }])
    })

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

    success = true
    createGuess(true)
    guessesRemaining--
    cursorLocation.set(-1)

    // send google analytics event 'guess_correct'
    if (browser && window.gtag) {
      window.gtag('event', 'guess_correct', {
        event_category: 'engagement',
        event_label: 'correct guess',
        prompt_text: data.challenge?.gamePrompt?.prompt,
        guess_count: guess?.guesses?.length,
      })
    }
  }

  const handleIncorrectGuess = () => {
    console.log(`wrong`)

    if (guessesRemaining <= 1) {
      console.log(`creating final guess`)
      createGuess(false)
    } else {
      console.log(`creating non-final guess, ${guessesRemaining} guesses left`)
      createGuess(null)
    }

    guessesRemaining--
    currentGuess.set([])
    cursorLocation.set(0)

    // send google analytics event 'guess_incorrect'
    if (browser && window.gtag) {
      window.gtag('event', 'guess_incorrect', {
        event_category: 'engagement',
        event_label: 'incorrect guess',
        prompt_text: data.challenge?.gamePrompt?.prompt,
        guess_count: guess?.guesses?.length,
      })
    }
  }

  const submitGuess = () => {
    if ($currentGuess?.length < data.challenge?.gamePrompt?.prompt?.length) return

    console.log(`checking answer, ${guessesRemaining} guesses left`)

    isCorrect($currentGuess, data.challenge?.gamePrompt?.prompt)
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

    // send google analytics event 'hint_click'
    if (browser && window.gtag) {
      window.gtag('event', 'hint_click', {
        event_category: 'engagement',
        event_label: 'hint clicked',
        prompt_text: data.challenge?.gamePrompt?.prompt,
        hint_text: text,
        guess_count: guess?.guesses?.length,
      })
    }
  }

  const hintUsedInGuess = (guess: StreakGuessingGameGuessResult, hintText: string) => {
    if (!guess) return true // Block hint reveals until a guessResult entity is loaded
    if (!guess?.hintsUsed) {
      return false
    }

    return guess.hintsUsed.includes(hintText)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const attemptToSubmitGuess = async (_event?: Event) => {
    if (!browser) return
    if ($currentGuess.length !== data.challenge?.gamePrompt?.prompt?.length) return

    submitGuess()
    return
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
    jsConfetti = new JSConfetti() // FIXME: this adds a canvas element to the DOM, which should only be done once, or else needs teardown
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
    shareTextSuccessMessage = `🥳 I guessed ${data.challenge?.gamePrompt?.prompt.toUpperCase()} on the ${shareTextNthTryCopy(
      guessesLimit - guessesRemaining
    )} try!`
  }
  $: shareTextFailureMessage = `🫣 I couldn’t guess ${data.challenge?.gamePrompt?.prompt.toUpperCase()}!`
  $: shareTextGuesses = (guess?.guesses || []).map(shareTextNthGuessCopy).join(`\n`)
  let shareTextStats = ``
  $: {
    shareTextStats = `🛟 ${uniq(guess?.hintsUsed || []).length}`
  }
  let newLine = `\n`
  let finalPrompt = `✍️ Now it’s your turn`

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
      newLine,
      finalPrompt,
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
  title={data.pageContent.pageTitle}
  description={data.pageContent.pageDescription}
  imageUrl={bestImageUrl(data.challenge?.choodle)}
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

    <ChoodleContainer --choodle-max-height-offset="26rem">
      <img src={bestImageUrl(data.challenge?.choodle)} alt="" />
    </ChoodleContainer>

    {#if guessesRemaining < guessesLimit && data.copy.guess_incorrectFeedbackText}
      <p class="failure">{data.copy.guess_incorrectFeedbackText}</p>
    {:else}
      <p><!-- layout placeholder --></p>
    {/if}
    <GuessingInterface
      format={data.challenge?.gamePrompt?.prompt.split('')}
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
      <section class="top-content block-content">
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

<style>
  .topBar {
    width: 100%;
  }

  .top-content {
    margin: 3rem 0;
  }

  .failure {
    color: var(--choodle-red);
    line-height: 1rem;
  }

  [slot='between'] {
    width: 100%;
  }
</style>
