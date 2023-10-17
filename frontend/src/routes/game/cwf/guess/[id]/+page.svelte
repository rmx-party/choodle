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
  import {choodleYellow, pageBackgroundDefault} from '$lib/Configuration';
  import LayoutContainer from '../../../../../components/LayoutContainer.svelte';
  import ChoodleContainer from '../../../../../components/ChoodleContainer.svelte';
  import {loading} from '$lib/store';
  import Keyboard from '../../../../../components/Keyboard.svelte';
  import {readOnlyClient, readWriteClient} from "$lib/CMSUtils";
  import Hints from '../../Hints.svelte';

  loading.set(true)

  const hints = [
    {text: 'hint 1', used: false},
    {text: 'hint 2', used: false},
    {text: 'hint 3', used: true},
  ]
  const hintCta = "Need a hint?"

  export let data;
  const currentGuess = writable([])
  const cursorLocation = writable(0)

  // TODO: CMS manageed
  let guessesRemaining = 3;
  let guessesLimit = 3;

  let choodleOwner = false;
  let copiedToClipboard = false;
  let success = false;

  let deviceId
  let email
  let username
  let guesser
  let guess

  export const locateGuess = async ({guesserId, challengeId}: {
    guesserId: string | undefined,
    challengeId: string | undefined,
  }) => {
    const query = `*[_type == "guess"][guesser._ref match "${guesserId}" && challenge._ref match "${challengeId}"]`
    let guess = (await readOnlyClient.fetch(query))[0]
    if (!guess) {
      guess = await readWriteClient.create(
        {
          _type: "guess",
          guesser: {_ref: guesserId},
          challenge: {_ref: data.challenge._id},
          numberOfHintsUsed: 0,
        },
        {autoGenerateArrayKeys: true}
      )
    }
    return guess
  }

  const isCorrect = (guess, answer): boolean => {
    return guess.join('').toUpperCase() === answer.toUpperCase()
  }

  const handleCorrectGuess = () => {
    console.log(`right answer, you won the thing`)
    success = true

    goto(`/game/cwf/success/${data.choodle._id}`)
  }

  const handleIncorrectGuess = () => {
    console.log(`wrong`)
    currentGuess.set([])
    cursorLocation.set(0)
  }

  const check = () => {
    if ($currentGuess.length < data.gamePrompt.prompt.length) return;

    guessesRemaining--;
    console.log(`checking answer, ${guessesRemaining} guesses left`)

    isCorrect($currentGuess, data.gamePrompt.prompt) ? handleCorrectGuess() : handleIncorrectGuess()
  }

  const canShare = (shareable?): boolean => {
    if (!browser) return false;
    if (!navigator.share) return false;

    return navigator.canShare(shareable)
  }

  const share = async (event: Event) => {
    event.preventDefault()
    if (!browser) return;

    let gamePromptTiles = data.choodle.gamePrompt ? fp.map((char) => (char === ' ') ? '⬜' : '🟨', data.gamePrompt.prompt.split('')).join('') : ''

    const url = `${window.location.origin}/game/cwf/guess/${data.challenge._id}`
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

    deviceId = await getDeviceId()
    email = await getEmail()
    username = await getUsername()
    guesser = await locateCreator({email, deviceId, username})
    guess = await locateGuess({guesserId: guesser._id, challengeId: data.challenge._id})

    loading.set(false)
  })
</script>

<MetaData url={$page.url}
          title="Choodle with Friends"
          imageUrl={urlFor(data.choodle.upScaledImage).url()}
          width="430"
          height="932"
          themeColor={choodleYellow}
          bgColor={pageBackgroundDefault}
/>

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
    <h3><strong>{data.gamePrompt.prompt.toUpperCase()}</strong></h3>
    <div>
      <Button colour="yellow"
              on:click={share}>{copiedToClipboard ? data.copy.guess_copiedToClipboard : data.copy.guess_shareButtonText}</Button>
    </div>
    <div>
      <Button on:click={() => {goto('/game/cwf')}}>Dashboard</Button>
    </div>
  {:else}
    {#if success}
      <p class="">{data.copy.guess_successMessageText}</p>
      <GuessInput
        format={data.gamePrompt.prompt.split('')}
        display={data.gamePrompt.prompt.split('').map(str => str.toUpperCase())}
        cursorLocation={-1} --bgcolor="var(--choodle-yellow)"/>
      <p><!-- layout placeholder --> </p>
      <Keyboard onKeyPress={() => {}}/>
    {:else}
      {#if guessesRemaining < 1}
        <p class="failure">{data.copy.guess_failureMessageText ? data.copy.guess_failureMessageText : ' '}</p>
        <GuessInput
          format={data.gamePrompt.prompt.split('')}
          display={data.gamePrompt.prompt.split('').map(str => str.toUpperCase())}
          cursorLocation={-1} --bgcolor="var(--choodle-yellow)"/>

        <p><!-- layout placeholder --> </p>
        <div style={`height: 10rem; /* corresponds to game keyboard height */`}>
          <Button colour="yellow" on:click={() => {goto(`/game/cwf/pick`)}}>
            {data.copy.guess_failureNewGameButtonText}
          </Button>
        </div>
      {:else}
        {#if guessesRemaining < guessesLimit && data.copy.guess_incorrectFeedbackText}
          <p class="failure">{data.copy.guess_incorrectFeedbackText}</p>
        {:else}
          <p><!-- layout placeholder --> </p>
        {/if}
        <GuessingInterface format={data.gamePrompt.prompt.split('')} inputDisplay={currentGuess}
                           cursorLocation={cursorLocation} onEnter={check}>
          <div slot="between">
            <Hints {hints} {hintCta}/>
          </div>
        </GuessingInterface>
      {/if}
    {/if}
  {/if}
</LayoutContainer>

<style>
  .topBar {
    width: 100%;
  }

  p {
    margin: 0.5rem;
  }

  .failure {
    color: red;
  }

  [slot='between'] {
    width: 100%;
  }
</style>
