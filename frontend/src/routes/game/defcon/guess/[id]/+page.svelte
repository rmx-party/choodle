<script lang="ts">
  import {urlFor} from '$lib/PersistedImagesUtils.js';
  import {writable} from "svelte/store";
  import GuessingHUD from "../../../../../components/GuessingHUD.svelte";
  import TopBar from "../../../../../components/TopBar.svelte";
  import Button from "../../../../../components/Button.svelte";
  import {goto} from "$app/navigation";
  import {page} from "$app/stores";
  import MetaData from "../../../../../components/MetaData.svelte";
  import {onMount} from "svelte";
  import {getDeviceId, getEmail, getUsername, locateCreator} from "$lib/CreatorUtils";
  import {browser} from "$app/environment";
  import fp from "lodash/fp";
  import GuessingInterface from "../../GuessingInterface.svelte";
  import GuessInput from "../../../../../components/GuessInput.svelte";
  import {toHTML} from "@portabletext/to-html";
  import {addPoints, readOnlyClient, readWriteClient} from "$lib/CMSUtils";
  import LayoutContainer from '../../../../../components/LayoutContainer.svelte';
  import {pageBackgroundDefault, choodleYellow} from '$lib/Configuration';
  import LoadingIndicator from "../../../../../components/LoadingIndicator.svelte";
  import {loading} from "$lib/store";
  import ChoodleContainer from '../../../../../components/ChoodleContainer.svelte';
  import Keyboard from '../../../../../components/Keyboard.svelte';

  loading.set(true)

  export let data;
  const currentGuess = writable([])
  const cursorLocation = writable(0)

  // TODO: CMS manageed
  let guessesRemaining = 3;
  let guessesLimit = 3;

  let choodleOwner = false;
  let copiedToClipboard = false;
  let alreadyGuessed = false;
  let success = false;

  let challenge
  let deviceId
  let email
  let username
  let guesser
  let guess

  async function locateChallenge(choodleId) {
    let query = `*[_type == "challenge" && game == "defcon"][choodle._ref match "${choodleId}"]`
    console.log(query)
    return (await readOnlyClient.fetch(query))[0]
  }

  export const locateGuess = async ({guesserId, choodleId}: {
    guesserId: string | undefined,
    choodleId: string | undefined,
  }) => {
    const challenge = await locateChallenge(choodleId)
    const query = `*[_type == "guess"][guesser._ref match "${guesserId}" && challenge._ref match "${challenge._id}"]`
    let guess = (await readOnlyClient.fetch(query))[0]
    if (!guess) {
      guess = await readWriteClient.create(
        {
          _type: "guess",
          guesser: {_ref: guesserId},
          challenge: {_ref: challenge._id}
        },
        {autoGenerateArrayKeys: true}
      )
    }
    return guess
  }

  const check = async () => {
    if ($currentGuess.length < data.choodle.gamePrompt.length) return;

    guessesRemaining--;
    console.log(`checking answer, ${guessesRemaining} guesses left`)

    if ($currentGuess.join('').toUpperCase() !== data.choodle.gamePrompt.toUpperCase()) {
      console.log(`wrong`)
      currentGuess.set([])
      cursorLocation.set(0)

      if (guessesRemaining < 1) {
        readWriteClient
          .patch(guess._id)
          .setIfMissing({guesses: []})
          .append('guesses', [$currentGuess.join('')])
          .set({guessedCorrectly: false})
          .commit()
      }

      return
    }

    console.log(`right answer, you won the thing`)
    success = true

    /* Points
       3 for guessing correctly on first try
       2 on second
       1 on third
    */
    let amount = guessesRemaining + 1
    let reason = `Guessed correctly with ${guessesRemaining} remaining.`

    await readWriteClient
      .patch(guess._id)
      .setIfMissing({guesses: []})
      .append('guesses', [$currentGuess.join('')])
      .set({guessedCorrectly: true})
      .commit()
    await addPoints(guesser._id, amount, reason, challenge._id)

    // Points to the creator for having a drawing guessed correctly.
    await addPoints(challenge.challenger._ref, 5, `${guesser.username} guessed your drawing correctly.`, challenge._id)
  }

  const canShare = (shareable?): boolean => {
    if (!browser) return false;
    if (!navigator.share) return false;

    return navigator.canShare(shareable)
  }

  const share = async (event: Event) => {
    event.preventDefault()
    if (!browser) return;

    let gamePromptTiles = data.choodle.gamePrompt ? fp.map((char) => (char === ' ') ? '⬜' : '🟨', data.choodle.gamePrompt.split('')).join('') : ''

    const url = `${window.location.origin}/game/cwf/guess/${data.choodle._id}`
    const shareCopy = data.copy.share_messageText || ''
    const text = [shareCopy, gamePromptTiles, url].join(`\n`)
    const shareable = {text};

    console.log(`sharing:`, shareable)

    if (canShare(shareable)) {
      console.log('Thanks for sharing!');
      navigator.share(shareable);
    } else {
      console.log(`copied "${text}" to clipboard`)
      await navigator.clipboard.writeText(text);
      copiedToClipboard = true;
    }
  }

  onMount(async () => {
    choodleOwner = (data.choodle.creatorId === await getDeviceId())
    challenge = await locateChallenge(data.choodle._id)

    deviceId = await getDeviceId()
    email = await getEmail()
    username = await getUsername()
    guesser = await locateCreator({email, deviceId, username})
    guess = await locateGuess({guesserId: guesser._id, choodleId: data.choodle._id})

    alreadyGuessed = guess.guessedCorrectly !== undefined
    success = !!guess.guessedCorrectly

    if (guess?.guesses) {
      guessesRemaining = (guessesLimit - guess?.guesses?.length)
    }

    loading.set(false)
  })
</script>

<MetaData url={$page.url}
          title="Choodle w/ Friends: DEFcon Edition"
          themeColor={choodleYellow}
          bgColor={pageBackgroundDefault}
          imageUrl={urlFor(data.choodle.upScaledImage).url()}
          width="430"
          height="932"
/>

{#if $loading}
  <LoadingIndicator explanation="enhancing happiness"/>
{:else}
  <LayoutContainer class="no-pan">
    <div class="topBar" slot="topBar">
      {#if choodleOwner}
        <TopBar>
          <div slot="topBarContent">
            {@html toHTML(data.copy.guess_pageAuthorTopContent)}
          </div>
        </TopBar>
      {:else}
        <GuessingHUD {guessesRemaining} {guessesLimit}>
          <div slot="content">
            {@html toHTML(data.copy.guess_pageTopContent)}
          </div>
        </GuessingHUD>
      {/if}
    </div>

    <ChoodleContainer>
      <img src={urlFor(data.choodle.upScaledImage).url()} width='390' height='520' alt=''/>
    </ChoodleContainer>

    {#if choodleOwner}
      <h3><strong>{data.choodle.gamePrompt.toUpperCase()}</strong></h3>
      <div>
        <Button colour="yellow"
                on:click={share}>{copiedToClipboard ? data.copy.guess_copiedToClipboard : data.copy.guess_shareButtonText}</Button>
      </div>
    {:else}
      {#if success}
        <p class="">{data.copy.guess_successMessageText}</p>
        <GuessInput
          format={data.choodle.gamePrompt.split('')}
          display={data.choodle.gamePrompt.split('').map(str => str.toUpperCase())}
          cursorLocation={-1} --bgcolor="var(--choodle-yellow)"/>
        <p><!-- layout placeholder --> </p>
        <div>
          <Button on:click={() => { goto('/game/defcon')}}
                  colour="yellow">{data.copy.success_continueGameButtonText}</Button>
        </div>
      {:else}
        {#if guessesRemaining < 1 || alreadyGuessed}
          <p class="failure">{data.copy.guess_failureMessageText ? data.copy.guess_failureMessageText : ' '}</p>
          <GuessInput
            format={data.choodle.gamePrompt.split('')}
            display={data.choodle.gamePrompt.split('').map(str => str.toUpperCase())}
            cursorLocation={-1} --bgcolor="var(--choodle-yellow)"/>

          <p><!-- layout placeholder --> </p>
          <div style={`height: 10rem; /* corresponds to game keyboard height */`}>
            <Button colour="yellow" on:click={() => {goto(`/game/defcon`)}}>
              {data.copy.guess_failureNewGameButtonText}
            </Button>
          </div>
        {:else}
          {#if guessesRemaining < guessesLimit && data.copy.guess_incorrectFeedbackText}
            <p class="failure">{data.copy.guess_incorrectFeedbackText}</p>
          {:else}
            <p><!-- layout placeholder --> </p>
          {/if}
          <GuessingInterface format={data.choodle.gamePrompt.split('')} inputDisplay={currentGuess}
                             cursorLocation={cursorLocation} onEnter={check}>
            <div slot="between">
              <p><!-- layout placeholder --> </p>
            </div>
          </GuessingInterface>
        {/if}
      {/if}
    {/if}
  </LayoutContainer>
{/if}

<style>
  .failure {
    color: red;
  }

  p {
    margin: 0.5rem;
  }

  .topBar {
    width: 100%;
  }
</style>
