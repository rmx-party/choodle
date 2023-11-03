<script lang="ts">
  import { urlFor } from '$lib/PersistedImagesUtils.js';
  import { writable } from 'svelte/store';
  import GuessingHUD from '../../../../../components/GuessingHUD.svelte';
  import TopBar from '../../../../../components/TopBar.svelte';
  import Button from '../../../../../components/Button.svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import MetaData from '../../../../../components/MetaData.svelte';
  import { onMount } from 'svelte';
  import { getDeviceId, getEmail, getUsername, locateCreator } from '$lib/CreatorUtils';
  import { browser } from '$app/environment';
  import fp from 'lodash/fp';
  import GuessingInterface from '../../GuessingInterface.svelte';
  import GuessInput from '../../../../../components/GuessInput.svelte';
  import { toHTML } from '@portabletext/to-html';
  import {
    choodleCreatorUsernameKey,
    choodleYellow,
    pageBackgroundDefault,
  } from '$lib/Configuration';
  import LayoutContainer from '../../../../../components/LayoutContainer.svelte';
  import ChoodleContainer from '../../../../../components/ChoodleContainer.svelte';
  import { readOnlyClient, readWriteClient } from '$lib/CMSUtils';
  import Hints from '../../Hints.svelte';
  import { closeDialog, loading, loadingMessage, openDialog } from '$lib/store';
  import Dialog from '../../../../../components/Dialog.svelte';
  import localforage from 'localforage';
  import { isNormalizedGameComplete, isPlayerInGame, normalizeGame } from '$lib/CWFGame';

  loadingMessage.set('loading');

  export let data;
  const currentGuess = writable([]);
  const cursorLocation = writable(0);

  // TODO: CMS manageed
  let guessesRemaining = 3;
  let guessesLimit = 3;

  let choodleOwner = false;
  let copiedToClipboard = false;
  let success = false;

  let deviceId;
  let email;
  let username = '';
  let guesser;
  let guess;
  let game;
  let disableKeyboard = false;

  let hints = [];
  $: {
    hints = fp.filter(
      (h) => h.text,
      [
        { text: data.gamePrompt.hint, used: hintUsedInGuess(guess, data.gamePrompt.hint) },
        { text: data.gamePrompt.hint_2, used: hintUsedInGuess(guess, data.gamePrompt.hint_2) },
        { text: data.gamePrompt.hint_3, used: hintUsedInGuess(guess, data.gamePrompt.hint_3) },
      ]
    );
  }

  const createCounterChallenge = async () => {
    console.log({ game });
    console.log({ isPlayerInGame: isPlayerInGame(game, guesser) });

    if (!isPlayerInGame(game, guesser)) goto(`/game/cwf/pick`);

    console.log('creating the challenge and updating current challenge');
    const challengeId = `challenge-${window.crypto.randomUUID()}`;
    const transaction = await readWriteClient
      .transaction()
      .create({
        _id: challengeId,
        _type: 'challenge',
        challenger: { _ref: guesser._id },
        gameRef: { _ref: game._id },
      })
      .patch(game._id, (p) => p.set({ currentChallenge: { _ref: challengeId } }))
      .commit({ autoGenerateArrayKeys: true });
    console.log(transaction);
    goto(`/game/cwf/pick/${challengeId}`);
  };

  const challengeHasBeenGuessed = (game, challenge) => {
    return fp.isEmpty(
      fp.filter((guessResult) => guessResult.challenge._id === challenge._id, game.guessResults)
    );
  };

  const locateGame = async ({ challengerId, guesserId, guessId }) => {
    const query = `*[_type == "cwfgame"][(player1._ref match "${challengerId}" && player2._ref match "${guesserId}") || (player1._ref match "${guesserId}" && player2._ref match "${challengerId}")]{..., guessResults[]->{...}, player1->{...}, player2->{...}, challenge->{...}}`;
    let locatedGame = (await readOnlyClient.fetch(query))[0];
    console.log({ locatedGame });
    if (locatedGame && challengeHasBeenGuessed(locatedGame, data.challenge)) {
      console.log(
        'this challenge has already been guessed within this game, do not create or update the game'
      );
      return locatedGame;
    }
    if (!locatedGame || isNormalizedGameComplete([...normalizeGame(locatedGame).guessResults])) {
      console.log('create');
      locatedGame = await readWriteClient.create(
        {
          _type: 'cwfgame',
          player1: { _ref: challengerId },
          player2: { _ref: guesserId },
          currentChallenge: { _ref: data.challenge._id },
        },
        { autoGenerateArrayKeys: true }
      );
    } else {
      console.log('update');
      console.log({ game: locatedGame });
      const patch = readWriteClient.patch(locatedGame._id);
      if (locatedGame.guessResults.map((gr) => gr._id).includes(guess._id)) {
        console.log('we already have this guess');
      } else {
        console.log('adding a guessResult');
        patch.append('guessResults', [{ _ref: guessId }]);
      }
      patch.commit({ autoGenerateArrayKeys: true });
    }

    return locatedGame;
  };

  export const locateGuess = async ({
    guesserId,
    challengeId,
  }: {
    guesserId: string | undefined;
    challengeId: string | undefined;
  }) => {
    console.log('locateGuess');
    const query = `*[_type == "guess"][guesser._ref match "${guesserId}" && challenge._ref match "${challengeId}"]`;
    let guess = (await readOnlyClient.fetch(query))[0];
    console.log(guess);
    if (!guess) {
      console.log('create a new guess');
      guess = await readWriteClient.create(
        {
          _type: 'guess',
          guesser: { _ref: guesserId },
          challenge: { _ref: data.challenge._id },
        },
        { autoGenerateArrayKeys: true }
      );
    }
    console.log('returning that guess');
    return guess;
  };

  const isCorrect = (guess, answer): boolean => {
    return guess.join('').toUpperCase() === answer.toUpperCase();
  };

  const createGuess = async (guessedCorrectly: boolean | null) => {
    console.log(`adding guess, resolving result to`, guessedCorrectly);
    const guessResult = readWriteClient
      .patch(guess._id)
      .setIfMissing({ guesses: [] })
      .append('guesses', [$currentGuess.join('')]);

    if (guessedCorrectly !== null) {
      guessResult.set({ guessedCorrectly });
    }
    const finalGuessResult = await guessResult.commit({ autoGenerateArrayKeys: true });
    console.log({ finalGuessResult });

    if (guessedCorrectly !== null) {
      console.log('guess completed, adding to game');
      await readWriteClient
        .patch(game._id)
        .setIfMissing({ guessResults: [] })
        .append('guessResults', [{ _ref: finalGuessResult._id }])
        .commit({ autoGenerateArrayKeys: true });
    }
  };

  const handleCorrectGuess = () => {
    console.log(`right answer, you won the thing`);
    success = true;

    if (usernameRequired && !username.length) {
      promptForAndSetUsername();
      return;
    }

    createGuess(true);
    cursorLocation.set(-1);
  };

  const handleIncorrectGuess = () => {
    console.log(`wrong`);

    if (guessesRemaining < 1) {
      if (usernameRequired && !username.length) {
        promptForAndSetUsername();
        return;
      }
      createGuess(false);
    } else {
      createGuess(null);
    }

    currentGuess.set([]);
    cursorLocation.set(0);
  };

  const submitGuess = () => {
    if ($currentGuess.length < data.gamePrompt.prompt.length) return;

    guessesRemaining--;
    console.log(`checking answer, ${guessesRemaining} guesses left`);

    isCorrect($currentGuess, data.gamePrompt.prompt)
      ? handleCorrectGuess()
      : handleIncorrectGuess();
  };

  const canShare = (shareable?): boolean => {
    if (!browser) return false;
    if (!navigator.share) return false;

    return navigator.canShare(shareable);
  };

  const share = async (event: Event) => {
    event.preventDefault();
    if (!browser) return;

    let gamePromptTiles = data.choodle.gamePrompt
      ? fp.map((char) => (char === ' ' ? '⬜' : '🟨'), data.gamePrompt.prompt.split('')).join('')
      : '';

    const url = `${window.location.origin}/game/cwf/guess/${data.challenge._id}`;
    const shareCopy = data.copy.share_messageText || '';
    const text = [shareCopy, gamePromptTiles, url].join(`\n`);
    const shareable = { text };

    console.log(`sharing:`, shareable);

    if (canShare(shareable)) {
      console.log('Thanks for sharing!');
      navigator.share(shareable);
    } else {
      console.log(`copied "${text}" to clipboard`);
      await navigator.clipboard.writeText(text);
      copiedToClipboard = true;
    }
  };

  const afterHint = (hint) => {
    if (hintUsedInGuess(guess, hint.text)) {
      console.log(`hint already used ${hint.text}`);
      return;
    }

    console.log(`adding ${hint.text} to the used hints on ${guess._id}`);

    readWriteClient
      .patch(guess._id)
      .setIfMissing({ hintsUsed: [] })
      .append('hintsUsed', [hint.text])
      .commit();
  };

  const hintUsedInGuess = (guess, hintText) => {
    console.log(`hintUsedInGuess, ${guess?._id}, ${hintText}`);
    if (!guess?.hintsUsed) {
      console.log('no hints used');
      return false;
    }

    return guess.hintsUsed.includes(hintText);
  };

  const usernamePromptId = 'username-prompt';

  // TODO: switch back for username driven gameplay after prod deploy
  const usernameRequired = true;
  const promptForAndSetUsername = async () => {
    console.log('prompting for username');
    if (!browser) return;

    if (username.length > 0) {
      console.log('there was a username, closing the dialog');
      disableKeyboard = false;
      closeDialog(usernamePromptId);
      await localforage.setItem(choodleCreatorUsernameKey, username);
      guesser = await locateCreator({ username, deviceId });
      submitGuess();
      return;
    }

    console.log('disable keyboard and open username dialog');
    disableKeyboard = true;
    openDialog(usernamePromptId);
  };

  const attemptToSubmitGuess = async (event: Event) => {
    if (!browser) return;
    if ($currentGuess.length !== data.choodle.gamePrompt.length) return;

    submitGuess();
    return;
  };

  onMount(async () => {
    deviceId = await getDeviceId();

    email = await getEmail();
    username = (await getUsername()) || '';
    guesser = await locateCreator({ email, deviceId, username });

    console.log({ challenge: data.challenge });
    choodleOwner = data.challenge.challenger._id === guesser._id; // TODO: this is based on device+choodle, should be by creator account

    console.log({ choodleOwner });

    if (choodleOwner) return loading.set(false);

    guess = await locateGuess({ guesserId: guesser._id, challengeId: data.challenge._id });

    if (!choodleOwner) {
      game = await locateGame({
        challengerId: data.challenge.challenger._id,
        guesserId: guesser._id,
        guessId: guess._id,
      });
      console.log({ game });
    }

    if (guess.guessedCorrectly) {
      success = true;
    }

    loading.set(false);
  });

  const bestImageUrl = (choodle) => {
    let bestImage = choodle.upScaledImage;

    if (!bestImage) {
      bestImage = choodle.image;
    }

    return urlFor(bestImage).url();
  };
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

  <ChoodleContainer --choodle-max-height-offset="27rem">
    <img src={bestImageUrl(data.choodle)} alt="" />
  </ChoodleContainer>

  {#if choodleOwner}
    <h3><strong>{data.gamePrompt.prompt.toUpperCase()}</strong></h3>
    <div>
      <Button colour="yellow" on:click={share}
        >{copiedToClipboard
          ? data.copy.guess_copiedToClipboard
          : data.copy.guess_shareButtonText}</Button
      >
    </div>
    <div>
      <Button
        on:click={() => {
          goto('/game/cwf');
        }}>{data.copy.guess_doneButtonText}</Button
      >
    </div>
  {:else if success}
    <p class="success">{data.copy.guess_successMessageText}</p>
    <GuessInput
      format={data.gamePrompt.prompt.split('')}
      display={data.gamePrompt.prompt.split('').map((str) => str.toUpperCase())}
      cursorLocation={-1}
      --bgcolor="var(--choodle-yellow)"
    />
    <p><!-- layout placeholder --></p>
    <div>
      <Button colour="yellow" on:click={createCounterChallenge}>
        {data.copy.success_continueGameButtonText}
      </Button>
      <Button
        on:click={() => {
          goto('/game/cwf');
        }}
      >
        {data.copy.guess_doneButtonText}
      </Button>
    </div>
  {:else if guessesRemaining < 1}
    <p class="failure">
      {data.copy.guess_failureMessageText ? data.copy.guess_failureMessageText : ' '}
    </p>
    <GuessInput
      format={data.gamePrompt.prompt.split('')}
      display={data.gamePrompt.prompt.split('').map((str) => str.toUpperCase())}
      cursorLocation={-1}
      --bgcolor="var(--choodle-yellow)"
    />

    <p><!-- layout placeholder --></p>
    <div style={`height: 10rem; /* corresponds to game keyboard height */`}>
      <Button
        colour="yellow"
        on:click={() => {
          goto(`/game/cwf/pick`);
        }}
      >
        {data.copy.guess_failureNewGameButtonText}
      </Button>
      <div>
        <Button
          on:click={() => {
            goto('/game/cwf');
          }}>{data.copy.guess_doneButtonText}</Button
        >
      </div>
    </div>
  {:else}
    {#if guessesRemaining < guessesLimit && data.copy.guess_incorrectFeedbackText}
      <p class="failure">{data.copy.guess_incorrectFeedbackText}</p>
    {:else}
      <p><!-- layout placeholder --></p>
    {/if}
    <GuessingInterface
      format={data.gamePrompt.prompt.split('')}
      inputDisplay={currentGuess}
      {cursorLocation}
      onEnter={attemptToSubmitGuess}
      {disableKeyboard}
    >
      <div slot="between">
        <Hints {hints} hintCta={data.copy.guess_needHintCtaText} {afterHint} />
      </div>
    </GuessingInterface>
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
