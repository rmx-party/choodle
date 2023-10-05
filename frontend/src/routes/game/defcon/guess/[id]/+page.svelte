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

  export let data;
  const currentGuess = writable([])
  const cursorLocation = writable(0)

  // TODO: CMS manageed
  let guessesRemaining = 3;
  let guessesLimit = 3;

  let choodleOwner = false;
  let copiedToClipboard = false;

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
    const deviceId = await getDeviceId()
    const email = await getEmail()
    const username = await getUsername()

    const guesser = await locateCreator({email, deviceId, username})
    const guess = await locateGuess({guesserId: guesser._id, choodleId: data.choodle._id})
    const challenge = await locateChallenge(data.choodle._id)

    await readWriteClient
      .patch(guess._id)
      .setIfMissing({guesses: []})
      .append('guesses', [$currentGuess.join('')])
      .commit()

    if ($currentGuess.length < data.choodle.gamePrompt.length) return;

    guessesRemaining--;
    console.log(`checking answer, ${guessesRemaining} guesses left`)

    if ($currentGuess.join('').toUpperCase() !== data.choodle.gamePrompt.toUpperCase()) {
      console.log(`wrong`)
      currentGuess.set([])
      cursorLocation.set(0)

      if (guessesRemaining < 1) {
        await readWriteClient
          .patch(guess._id)
          .set({guessedCorrectly: false})
          .commit()
      }

      return
    }

    /* Points
       3 for guessing correctly on first try
       2 on second
       1 on third
    */
    let amount = guessesRemaining + 1
    let reason = `Guessed correctly with ${guessesRemaining} remaining.`

    await addPoints(guesser._id, amount, reason, challenge._id)
    await readWriteClient
      .patch(guess._id)
      .set({guessedCorrectly: true})
      .commit()

    console.log(`right answer, you won the thing`)
    goto(`/game/defcon/success/${data.choodle._id}`)
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
  })
</script>

<MetaData url={$page.url.toString()}
          imageUrl={urlFor(data.choodle.upScaledImage).url()}
          width="430"
          height="932"
/>

<div class="flex-container">
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

  <div class="choodle-container">
    <img class="choodle" src={urlFor(data.choodle.upScaledImage).url()}
         width='390' height='520' alt=''/>
  </div>

  {#if choodleOwner}
    <h3><strong>{data.choodle.gamePrompt.toUpperCase()}</strong></h3>
    <div>
      <Button colour="yellow"
              on:click={share}>{copiedToClipboard ? data.copy.guess_copiedToClipboard : data.copy.guess_shareButtonText}</Button>
    </div>
  {:else}
    {#if guessesRemaining < 1}
      <p class="failure">{data.copy.guess_failureMessageText ? data.copy.guess_failureMessageText : ' '}</p>
      <GuessInput
        format={data.choodle.gamePrompt.split('')}
        display={data.choodle.gamePrompt.split('').map(str => str.toUpperCase())}
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
      <GuessingInterface format={data.choodle.gamePrompt.split('')} inputDisplay={currentGuess}
                         cursorLocation={cursorLocation} onEnter={check}>
        <div slot="between">
          {#if 'hint message data tbd'}
            <p><a>Need a hint?</a></p>
          {:else}
            <p><!-- layout placeholder --> </p>
          {/if}
        </div>
      </GuessingInterface>
    {/if}
  {/if}
</div>

<style>
  :global(:root) {
    --page-background-color: rgba(20, 21, 24, 0.03);
  }

  .flex-container {
    background-color: rgba(20, 21, 24, 0.03);

    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-content: center;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    height: 100svh;
    height: calc(var(--vh, 1vh) * 100); /* https://css-tricks.com/the-trick-to-viewport-units-on-mobile/ */

    padding-bottom: 1rem;
  }

  :root {
    text-align: center;
  }

  .choodle-container {
    flex-grow: 1;
    display: flex;
    align-items: center;
    padding: 0;
    flex-grow: 1;
    flex-shrink: 1;
    /* max-height: calc(100svh - 20rem); */
    max-height: 15rem; /* TODO: use breakpoints to allow this to scale up based on available screen */
    max-width: 100%;
    aspect-ratio: 3/4;
  }

  img.choodle {
    object-fit: contain;
    flex-shrink: 1;
    flex-grow: 1;
    max-height: 100%;
    max-width: 100%;
    image-rendering: pixelated;

    border-radius: 0.22175rem;
    box-shadow: 1px 1px 17.74193572998047px 0.8870968222618103px rgba(0, 0, 0, 0.12);
  }

  .failure {
    color: red;
  }
</style>
