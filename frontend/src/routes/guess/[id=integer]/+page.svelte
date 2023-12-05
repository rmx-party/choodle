<script lang="ts">
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
  import Hints from '../../../components/Hints.svelte'
  import { loading, uncaughtErrors } from '$lib/store'
  import type { StreakGuessingGameGuessResult } from '$lib/CWFGame'
  import type { PageData } from './$types'
  import TextMessageBubble from '../../../components/TextMessageBubble.svelte'
  import { sharePath } from '$lib/routes'
  import uniq from 'lodash/fp/uniq'
  import JSConfetti from 'js-confetti'
  import type { User } from '@prisma/client'
  import { findOrCreateGuessResult, updateGuessResult } from '$lib/storage'

  loading.set(true)

  const guesser: Writable<User> = getContext('choodler')
  $: console.log(`guess page react`, { guesser: $guesser })

  export let data: PageData
  const currentGuess = writable([])
  const cursorLocation = writable(0)

  // TODO: CMS manageed
  const guessesLimit = 3
  let guessesRemaining = 3
  $: guessesRemaining = guessesLimit - (guessResult?.guesses?.length || 0)

  let choodleOwner = false
  $: choodleOwner = data.challenge?.userId === $guesser?.id
  $: {
    if (browser && data.challenge && $guesser && choodleOwner) {
      console.log(`choodle owner, going to share page`, data, $guesser)
      goto(sharePath(data.challenge.id))
    }
  }

  $: success = !!guessResult?.wasSuccessful
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

  let guessResult: StreakGuessingGameGuessResult
  let disableKeyboard = false

  // TODO: load game prompt and hints from sanity
  let hints: { text: string; used: boolean }[] = []
  $: {
    hints = filter(
      (hint) => !!hint.text,
      [
        {
          text: data.challengePrompt.hint,
          used: hintUsedInGuess(guessResult, data.challengePrompt.hint),
        },
        {
          text: data.challengePrompt.hint_2,
          used: hintUsedInGuess(guessResult, data.challengePrompt.hint_2),
        },
        {
          text: data.challengePrompt.hint_3,
          used: hintUsedInGuess(guessResult, data.challengePrompt.hint_3),
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

    // TODO: figure out if we can load guess in initial page load without breaking ISR caching
    // TODO: if not, figure out if we can eager-load and memoize the user's data at the layout context level, so that we don't have to do it after page load

    guessResult = await findOrCreateGuessResult({ guesserId, challengeId })

    loading.set(false)
    if (!guessResult) throw new Error(`no guess could be found or created`)
    console.log(`locateGuess result`, { guess: guessResult })
    alreadyLookingForGuess = false
  }

  const isCorrect = (guess: string[], answer: string): boolean => {
    return guess.join('').toUpperCase() === answer.toUpperCase()
  }

  const submitGuessAttempt = async (guessedCorrectly: boolean | null) => {
    console.log(`adding guess, resolving result to`, guessedCorrectly)

    guessResult = {
      ...guessResult,
      guesses: [...(guessResult.guesses || []), $currentGuess.join('')],
      final: guessedCorrectly || guessesRemaining <= 1,
      wasSuccessful: guessedCorrectly,
    }
    guessResult = await updateGuessResult(guessResult)

    console.log({ guess: guessResult })
  }

  const handleCorrectGuess = () => {
    console.log(`right answer, you won the thing`)

    success = true
    submitGuessAttempt(true)
    guessesRemaining--
    cursorLocation.set(-1)

    // send google analytics event 'guess_correct'
    if (browser && window.gtag) {
      window.gtag('event', 'guess_correct', {
        event_category: 'engagement',
        event_label: 'correct guess',
        prompt_text: data.challenge?.prompt,
        guess_count: guessResult?.guesses?.length,
      })
    }
  }

  const handleIncorrectGuess = () => {
    console.log(`wrong`)

    if (guessesRemaining <= 1) {
      console.log(`creating final guess`)
      submitGuessAttempt(false)
    } else {
      console.log(`creating non-final guess, ${guessesRemaining} guesses left`)
      submitGuessAttempt(null)
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
        guess_count: guessResult?.guesses?.length,
      })
    }
  }

  const submitGuess = () => {
    if ($currentGuess?.length < data.challenge?.prompt?.length) return

    console.log(`checking answer, ${guessesRemaining} guesses left`)

    isCorrect($currentGuess, data.challenge?.prompt) ? handleCorrectGuess() : handleIncorrectGuess()
  }

  const afterHint = async ({ text }: { text: string }) => {
    if (hintUsedInGuess(guessResult, text)) {
      console.log(`hint already used: \n${text}`)
      return
    }

    console.log(`adding "${text}" to the used hints on guessResult: ${guessResult.id}`)
    guessResult = { ...guessResult, hintsUsed: [...(guessResult.hintsUsed || []), text] }
    guessResult = await updateGuessResult({ id: guessResult.id, hintsUsed: guessResult.hintsUsed })
    // guessResult = await readWriteClient
    //   .patch(guessResult.id)
    //   .setIfMissing({ hintsUsed: [] })
    //   .append('hintsUsed', [text])
    //   .commit()

    // send google analytics event 'hint_click'
    if (browser && window.gtag) {
      window.gtag('event', 'hint_click', {
        event_category: 'engagement',
        event_label: 'hint clicked',
        prompt_text: data.challenge?.prompt,
        hint_text: text,
        guess_count: guessResult?.guesses?.length,
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
    if ($currentGuess.length !== data.challenge?.prompt?.length) return

    submitGuess()
    return
  }

  $: {
    if (!guessResult && $guesser?.id && data.challenge.id && !choodleOwner) {
      loading.set(true)
      console.log(
        `guess page, loading guess for guesser: ${$guesser.id} and challenge: ${data.challenge.id}`
      )
      locateGuess({ guesserId: $guesser.id, challengeId: data.challenge.id }).catch((error) => {
        uncaughtErrors.set([...$uncaughtErrors, { error }])
      })
    }
  }

  onMount(async () => {
    loading.set(false)
    jsConfetti = new JSConfetti() // FIXME: this adds a canvas element to the DOM, which should only be done once, or else needs teardown
  })

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
    shareTextSuccessMessage = `🥳 I guessed ${data.challenge?.prompt.toUpperCase()} on the ${shareTextNthTryCopy(
      guessesLimit - guessesRemaining
    )} try!`
  }
  $: shareTextFailureMessage = `🫣 I couldn’t guess ${data.challenge?.prompt.toUpperCase()}!`
  $: shareTextGuesses = (guessResult?.guesses || []).map(shareTextNthGuessCopy).join(`\n`)
  let shareTextStats = ``
  $: {
    shareTextStats = `🛟 ${uniq(guessResult?.hintsUsed || []).length}`
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
      .then((result) => {
        if (browser) {
          window?.gtag('event', 'click', {
            event_category: 'engagement',
            event_label: 'share_guess',
            prompt_text: data.challenge?.prompt,
          })
        }
        console.log(`shared`, { result })
      })
      .catch((error) => {
        if (browser) {
          window?.gtag('event', 'click', {
            event_category: 'engagement',
            event_label: 'share_guess_cancel',
            prompt_text: data.challenge?.prompt,
          })
        }
        console.error(`error sharing`, error)
      })
  }
</script>

<MetaData
  url={$page.url}
  title={data.pageContent.pageTitle}
  description={data.pageContent.pageDescription}
  imageUrl={data.challenge.drawing.imageUrl}
  width="430"
  height="932"
  themeColor={choodleYellow}
  bgColor={pageBackgroundDefault}
/>

{#if guessResult && stillGuessing}
  <LayoutContainer class="no-pan">
    <div class="topBar" slot="topBar">
      <GuessingHUD {guessesRemaining} {guessesLimit}>
        <div slot="content">
          {@html toHTML(data.copy.guess_pageTopContent)}
        </div>
      </GuessingHUD>
    </div>

    <ChoodleContainer --choodle-max-height-offset="26rem">
      <img src={data.challenge.drawing.imageUrl} alt="" />
    </ChoodleContainer>

    {#if guessesRemaining < guessesLimit && data.copy.guess_incorrectFeedbackText}
      <p class="failure">{data.copy.guess_incorrectFeedbackText}</p>
    {:else}
      <p><!-- layout placeholder --></p>
    {/if}
    <GuessingInterface
      format={data.challenge?.prompt.split('')}
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
{:else if guessResult}
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
