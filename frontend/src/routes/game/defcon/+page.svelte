<script lang="ts">
  import {goto} from "$app/navigation";
  import {onMount} from "svelte";
  import Button from "../../../components/Button.svelte";
  import {browser} from "$app/environment";
  import {getDeviceId, getEmail, getUsername, locateCreator} from "$lib/CreatorUtils";
  import LayoutContainer from "../../../components/LayoutContainer.svelte";
  import {page} from "$app/stores";
  import MetaData from "../../../components/MetaData.svelte";
  import {pageBackgroundDefault} from "$lib/Configuration";
  import {writable} from "svelte/store";
  import {readOnlyClient} from "$lib/CMSUtils";
  import fp from "lodash/fp";

  export let data
  let creator
  let hasCreatedAChallenge = false
  let points
  let pointsTotal = 0

  let guesses

  let challengesToBeGuessed
  let leaderboard

  const navItems = [
    'leaderboard',
    'my games',
    'rules'
  ]
  let activeTab = writable(navItems[0])

  // TODO: CMS-populate all the copy / non-dynamic html contents

  const startGame = async () => {
    await goto(`/game/defcon/pick`)
  }

  const assembleLeaderboard = async () => {
    const points = await readOnlyClient.fetch(`*[_type == "points"]{..., creator->{...}}`)
    const creatorUsernames = fp.uniq(fp.map(point => point.creator.username, points))


    return fp.orderBy(['totalPoints'], ['desc'],
      fp.map(creatorUsername => {
        let pointsForUser = fp.filter(point => point.creator.username === creatorUsername, points)

        let totalPoints = fp.reduce((accumulator, item) => {
          return accumulator + item.amount
        }, 0, pointsForUser)

        return {creatorUsername: creatorUsername || "unknown", totalPoints}

      }, creatorUsernames))
  }

  const getPointsForUser = async (creatorId) => {
    const points = await readOnlyClient.fetch(`*[_type == "points"][creator._ref match "${creatorId}"]`)
    console.log("points ", points)
    return points
  }

  const getGuessesForUser = async (creatorId) => {
    const guesses = await readOnlyClient.fetch(`*[_type == "guess"][guesser._ref match "${creatorId}"]{..., challenge->{..., choodle->{...}, challenger->{...}}}`)
    console.log("guesses ", guesses)
    return guesses

  }
  const challengesThatHaveNotBeenGuessed = async (creatorId, challenges, guesses) => {
    const guessedChallengeIds = fp.map(guess => guess.challenge._id, guesses)
    console.log("challenges", challenges)
    return fp.reject(challenge => guessedChallengeIds.includes(challenge._id), challenges)

  }
  onMount(async () => {
    if (!browser) return;


    creator = (await locateCreator({
      email: await getEmail(),
      username: await getUsername(),
      deviceId: await getDeviceId()
    })); // TODO: migrate global creator/player state to a store shared across pages
    points = await getPointsForUser(creator._id)
    pointsTotal = fp.reduce((accumulator, item) => {
      return accumulator + item.amount
    }, 0, points)

    leaderboard = await assembleLeaderboard()

    guesses = await getGuessesForUser(creator._id)
    challengesToBeGuessed = await challengesThatHaveNotBeenGuessed(creator._id, data.challenges, guesses)

    console.log({creator})
    if (creator?.choodles?.length > 0) { // TODO: figure out the appropriate test for game participation
      hasCreatedAChallenge = true;
    }
  })
</script>

<MetaData
  title="Choodle w/ Friends: DEFcon Edition"
  themeColor={pageBackgroundDefault}
  url={$page.url}
/>

<LayoutContainer>
  {#if !hasCreatedAChallenge || !creator}
    <p>you haven't tried drawing anything yet</p>
    <Button variant="primary" colour="yellow" on:click={startGame}>{data.copy.startGameButtonText}</Button>
  {:else}
    <div>
      <Button colour="yellow" on:click={startGame}>{data.copy.startGameButtonText}</Button>
    </div>

    <header>
      <h3><strong>{creator.username}</strong></h3>
      <h3>{pointsTotal} points</h3>
    </header>

    <nav>
      {#each navItems as navItem }
        <span on:click={() => { activeTab.set(navItem)}}>
          {#if navItem == $activeTab}
            <strong>{navItem}</strong>
          {:else}
            {navItem}
          {/if}
        </span>
      {/each}
    </nav>

    <section class="tabContent">
      <ul>
        <strong>Not guessed</strong>
        {#each challengesToBeGuessed as challenge}
          <li>
            <a href="/game/defcon/guess/{challenge.choodle._ref}">
              {challenge._createdAt} |
              {challenge.challenger.username}
            </a>
          </li>
        {/each}
        <strong>guessed</strong>
        {#each guesses as guess}
          <li>
            <a href="/game/defcon/guess/{guess.challenge.choodle._ref}">
              {guess.guessedCorrectly} | {guess.challenge._createdAt} |
              {guess.challenge.challenger.username}
            </a>
          </li>
        {/each}
      </ul>
    </section>

    <section class="tabContent">
      <strong>leaderboard</strong>
      {#each leaderboard as leaderboardItem}
        <ul>
          <li>{leaderboardItem.totalPoints} {leaderboardItem.creatorUsername}</li>
        </ul>
      {/each}
    </section>
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
    margin: 1rem 0;
    text-align: left;
  }

  nav > span {
    display: block;
    width: 100%;
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
</style>
