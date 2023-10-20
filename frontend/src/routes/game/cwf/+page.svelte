<script lang="ts">
  import {goto} from "$app/navigation";
  import {onMount} from "svelte";
  import Button from "../../../components/Button.svelte";
  import {getDeviceId, getEmail, getUsername, locateCreator} from "$lib/CreatorUtils";
  import LayoutContainer from "../../../components/LayoutContainer.svelte";
  import {page} from "$app/stores";
  import MetaData from "../../../components/MetaData.svelte";
  import {pageBackgroundDefault} from "$lib/Configuration";
  import {writable} from "svelte/store";
  import {readOnlyClient} from "$lib/CMSUtils";
  import fp from "lodash/fp";
  import {toHTML} from "@portabletext/to-html";
  import {loading} from "$lib/store";
  import {urlFor} from "$lib/PersistedImagesUtils";
  import {normalizeGame, streakCount} from "$lib/CWFGame";

  export let data
  let currentChoodler
  let hasCreatedAChallenge = false

  let guesses = []

  let challengesToBeGuessed = []

  let myGames = []

  const navItems = [
    'my games',
    'rules'
  ]
  let activeTab = writable(navItems[0])

  const startGame = async () => {
    await goto(`/game/cwf/pick`)
  }

  const getGuessesForUser = async (creatorId) => {
    const guesses = await readOnlyClient.fetch(`*[_type == "guess"][guesser._ref match "${creatorId}"]{..., challenge->{..., choodle->{...}, challenger->{...}}}`)
    console.log("user guesses ", guesses)
    return fp.reject(guess => guess.guessedCorrectly === undefined, guesses)
  }

  const challengesThatHaveNotBeenGuessed = async (creatorId, challenges, guesses) => {
    const guessedChallengeIds = fp.map(guess => guess.challenge._id, guesses)
    console.log("challenges", challenges)

    return fp.reject(challenge => challenge.challenger.username === currentChoodler.username,
      fp.reject(challenge => guessedChallengeIds.includes(challenge._id), challenges))
  }

  const myTurnGames = (games) => {
    return fp.filter((game) => {
      if (!game.guesses) return false
      return fp.last(game.guesses).guesser._id !== currentChoodler._id
    }, games)
  }

  const theirTurnGames = (games) => {
    return fp.filter((game) => {
      if (!game.guesses) return false
      return fp.last(game.guesses).guesser._id === currentChoodler._id
    }, games)
  }

  const otherPlayerIn = (game) => {
    if (game.player1._id === currentChoodler._id) return game.player2.username
    return game.player1.username
  }

  onMount(async () => {
    const emailFetch = getEmail()
    const usernameFetch = getUsername()
    const deviceIdFetch = getDeviceId()
    const creatorFetch = locateCreator({
      email: await emailFetch,
      username: await usernameFetch,
      deviceId: await deviceIdFetch
    }); // TODO: migrate global creator/player state to a store shared across pages

    currentChoodler = await creatorFetch;
    console.log({creator: currentChoodler})

    if (currentChoodler?.choodles?.length > 0) { // TODO: figure out the appropriate test for game participation
      hasCreatedAChallenge = true;
    } else {
      loading.set(false)
      return // Don't load leaderboard stuff if player can't see it anyway
    }

    guesses = await getGuessesForUser(currentChoodler._id)
    challengesToBeGuessed = await challengesThatHaveNotBeenGuessed(currentChoodler._id, data.challenges, guesses)

    console.log(`games`, data.games)
    myGames = fp.filter((game) => {
      return game.player1._id === currentChoodler._id || game.player2._id === currentChoodler._id
    }, data.games)
    console.log(`myGames`, myGames)

    loading.set(false)
  })
</script>

<MetaData
  title="Choodle w/ Friends"
  themeColor={pageBackgroundDefault}
  url={$page.url}
/>

<LayoutContainer>
  {#if !hasCreatedAChallenge || !currentChoodler}
    <img src={urlFor(data.copy.logo).url()} width="80%" style="margin: 3rem auto;" alt=''/>

    {@html toHTML(data.copy.landing_content)}

    <Button variant="primary" colour="yellow" on:click={startGame}
            style="margin: 3rem auto;">{data.copy.startGameButtonText}</Button>
  {:else}
    <div>
      <img src={urlFor(data.copy.logo).url()} width="80%" alt=''/>
    </div>
    <header>
      <h3><strong>{currentChoodler.username}</strong></h3>
    </header>

    <Button variant="primary" colour="yellow" on:click={startGame}
            style="margin: 3rem auto;">{data.copy.startGameButtonText}</Button>

    <nav>
      {#each navItems as navItem }
        <span on:click={() => { activeTab.set(navItem)}} class={`${navItem == $activeTab ? 'active' : ''}`}>
          {navItem}
        </span>
      {/each}
    </nav>

    {#if $activeTab === "my games"}
      <section class="tabContent my-games">
        <p>My Turn</p>
        {#each myTurnGames(myGames) as myTurnGame}
          <p>{otherPlayerIn(myTurnGame)} {streakCount(normalizeGame(myTurnGame))}</p>
        {/each}
        <p>Their Turn</p>
        {#each theirTurnGames(myGames) as myTurnGame}
          <p>{otherPlayerIn(myTurnGame)} {streakCount(normalizeGame(myTurnGame))}</p>
        {/each}

        <p>New My Games</p>
        {#each myGames as myGame}
          <pre style={`max-width: 100%; overflow: scroll;`}>{JSON.stringify(myGame)}</pre>
        {/each}
        <p>My turn</p>
        <ul>
          {#each challengesToBeGuessed as challenge}
            <li>
              <a href="{`/game/cwf/guess/${challenge._id}`}"
                 on:click={() => goto(`/game/cwf/guess/${challenge._id}`)}>
                <span class="status">Guess</span>
                <span class="username">{challenge.challenger.username}</span>
              </a>
            </li>
          {/each}
        </ul>
      </section>
      <section class="tabContent my-games">
        <p>Ended</p>
        <ul>
          {#each guesses as guess}
            <li>
              <span
                class={`${guess.guessedCorrectly ? "won" : "lost"} status`}>{guess.guessedCorrectly ? "Won :)" : "Lost :("}</span>
              <span class="username">{guess.challenge.challenger.username}</span>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    {#if $activeTab === "rules"}
      {@html toHTML(data.copy.rules_content)}
    {/if}
  {/if}
</LayoutContainer>

<style>

  header {
    display: block;
    width: 100%;
    text-align: right;
  }

  nav {
    display: block;
    width: 100%;
    margin: 1rem 0 2rem;
    text-align: left;

    text-transform: capitalize;
    font-size: 18px;
    font-family: 'DejaVu Sans Bold';
    color: darkgrey;
  }

  nav > span {
    display: block;
    width: 100%;
  }

  nav > .active {
    color: var(--choodle-black);
  }

  nav > span + span {
    margin-top: 1rem;
  }

  .tabContent {
    display: block;
    width: 100%;
    text-align: left;
  }

  .tabContent ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .highlight {
    background: var(--choodle-yellow)
  }

  table {
    width: 100%;
  }

  .my-games tr, nav > span {
    cursor: pointer;
  }

  .won {
    color: hsla(108, 90%, 28%, 1);
  }

  .lost {
    color: hsla(0, 100%, 21%, 1);
  }

  .status {
    text-align: center;
  }

  .username {
    text-align: right;
  }
</style>
