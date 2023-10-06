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
  import {toHTML} from "@portabletext/to-html";
  import {loading} from "$lib/store";
  import LoadingIndicator from "../../../components/LoadingIndicator.svelte";

  loading.set(true)

  export let data
  let currentChoodler
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
    console.log("user points ", points)
    return points
  }

  const getGuessesForUser = async (creatorId) => {
    const guesses = await readOnlyClient.fetch(`*[_type == "guess"][guesser._ref match "${creatorId}"]{..., challenge->{..., choodle->{...}, challenger->{...}}}`)
    console.log("user guesses ", guesses)
    return fp.reject(guess => guess.guessedCorrectly === undefined, guesses)
  }

  const challengesThatHaveNotBeenGuessed = async (creatorId, challenges, guesses) => {
    const guessedChallengeIds = fp.map(guess => guess.challenge._id, guesses)
    console.log("challenges", challenges)
    return fp.reject(challenge => guessedChallengeIds.includes(challenge._id), challenges)

  }

  onMount(async () => {
    if (!browser) return;

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

    points = await getPointsForUser(currentChoodler._id)
    pointsTotal = fp.reduce((accumulator, item) => {
      return accumulator + item.amount
    }, 0, points)

    leaderboard = await assembleLeaderboard()

    guesses = await getGuessesForUser(currentChoodler._id)
    challengesToBeGuessed = await challengesThatHaveNotBeenGuessed(currentChoodler._id, data.challenges, guesses)



    loading.set(false)
  })
</script>

<MetaData
  title="Choodle w/ Friends: DEFcon Edition"
  themeColor={pageBackgroundDefault}
  url={$page.url}
/>

{#if $loading}
  <LoadingIndicator explanation="enhancing happiness"/>
{:else}
  <LayoutContainer>
    {#if !hasCreatedAChallenge || !currentChoodler}
      {@html toHTML(data.copy.landing_content)}

      <Button variant="primary" colour="yellow" on:click={startGame}>{data.copy.startGameButtonText}</Button>
    {:else}
      <div>
        <Button colour="yellow" on:click={startGame}>{data.copy.startGameButtonText}</Button>
      </div>

      <header>
        <h3><strong>{currentChoodler.username}</strong></h3>
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

      {#if $activeTab === "my games"}
        <section class="tabContent my-games">
          <table>
            {#each challengesToBeGuessed as challenge}
              <tr on:click={() => {goto(`/game/defcon/guess/${challenge.choodle._ref}`)}}>
                <td class="status">Open</td>
                <td class="createdAt"><time>{challenge._createdAt}</time></td>
                <td class="username">{challenge.challenger.username}</td>
              </tr>
            {/each}
            {#each guesses as guess}
              <tr on:click={() => {goto(`/game/defcon/guess/${guess.challenge.choodle._id}`)}}>
                <td class={`${guess.guessedCorrectly ? "won" : "lost"} status`}>{guess.guessedCorrectly ? "Won :)" : "Lost :("}</td>
                <td class="createdAt"><time>{guess.challenge._createdAt}</time></td>
                <td class="username">{guess.challenge.challenger.username}</td>
              </tr>
            {/each}
          </table>
        </section>
      {/if}

      {#if $activeTab === "leaderboard"}
        <section class="tabContent leaderboard">
          <table>
            {#each leaderboard as leaderboardItem}
              <tr class="{currentChoodler.username === leaderboardItem.creatorUsername ? 'highlight' : ''}">
                <td class="score">
                  {leaderboardItem.totalPoints}
                </td>
                <td class="username">
                  {leaderboardItem.creatorUsername}
                </td>
              </tr>
            {/each}
          </table>
        </section>
      {/if}

      {#if $activeTab === "rules"}
        {@html toHTML(data.copy.rules_content)}
      {/if}
    {/if}
  </LayoutContainer>
{/if}

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

  .highlight {
    background: var(--choodle-yellow)
  }

  table {
    width: 100%;
  }
  .my-games tr, nav > span {
    cursor: pointer;
  }
  tr .won {
    color: hsla(108, 90%, 28%, 1);
  }
  tr .lost {
    color: hsla(0, 100%, 21%, 1);
  }
  .status {
    text-align: center;
  }
  .username {
    text-align: right;
  }
</style>
