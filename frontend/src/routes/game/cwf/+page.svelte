<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Button from '../../../components/Button.svelte';
	import { getDeviceId, getEmail, getUsername, locateCreator } from '$lib/CreatorUtils';
	import LayoutContainer from '../../../components/LayoutContainer.svelte';
	import { page } from '$app/stores';
	import MetaData from '../../../components/MetaData.svelte';
	import { pageBackgroundDefault } from '$lib/Configuration';
	import { writable } from 'svelte/store';
	import fp from 'lodash/fp';
	import { toHTML } from '@portabletext/to-html';
	import { loading } from '$lib/store';
	import { urlFor } from '$lib/PersistedImagesUtils';
	import { isGameComplete, normalizeGame, streakCount } from '$lib/CWFGame';

	export let data;
	let currentChoodler;
	let hasCreatedAChallenge = false;

	let myGames = [];

	const navItems = ['my games', 'rules'];
	let activeTab = writable(navItems[0]);

	const startGame = async () => {
		await goto(`/game/cwf/pick`);
	};

	let myTurnGames = [];
	let theirTurnGames = [];
	$: [myTurnGames, theirTurnGames] = fp.partition(isMyTurn, fp.reject(isGameComplete, myGames));

	const isMyTurn = (game) => {
		if (
			game.currentChallenge.challenger._id !== currentChoodler._id &&
			game.currentChallenge.choodle
		)
			return true;
		if (
			game.currentChallenge.challenger._id === currentChoodler._id &&
			!game.currentChallenge.choodle
		)
			return true;

		return false;
	};

	const otherPlayerIn = (game) => {
		if (game.player1._id === currentChoodler._id) return game.player2.username || 'player2 unknown';
		return game.player1.username || 'player1 unknown';
	};

	const sortedGuesses = (guesses) => {
		return fp.sortBy(['createdAt'], guesses);
	};

	const generateLinkFor = (game): string => {
		let currentChallenge = game.currentChallenge;

		if (currentChallenge.challenger._id === currentChoodler._id && !currentChallenge.choodle) {
			return `/game/cwf/pick/${currentChallenge._id}`;
		}

		if (currentChallenge.challenger._id !== currentChoodler._id && !currentChallenge.choodle) {
			return `/game/cwf/guess/${fp.last(game.guessResults).challenge._id}`;
		}

		return `/game/cwf/guess/${currentChallenge._id}`;
	};

	onMount(async () => {
		const emailFetch = getEmail();
		const usernameFetch = getUsername();
		const deviceIdFetch = getDeviceId();
		const creatorFetch = locateCreator({
			email: await emailFetch,
			username: await usernameFetch,
			deviceId: await deviceIdFetch
		}); // TODO: migrate global creator/player state to a store shared across pages

		currentChoodler = await creatorFetch;
		console.log({ creator: currentChoodler });

		if (currentChoodler?.choodles?.length > 0) {
			// TODO: figure out the appropriate test for game participation
			hasCreatedAChallenge = true;
		} else {
			loading.set(false);
			return; // Don't load leaderboard stuff if player can't see it anyway
		}

		myGames = fp.map(
			(game) => {
				return { ...game, guessResults: sortedGuesses(game.guessResults) };
			},
			fp.filter((game) => {
				return (
					game?.player1?._id === currentChoodler?._id || game?.player2?._id === currentChoodler?._id
				);
			}, data.games)
		);
		console.log(`myGames`, myGames);

		loading.set(false);
	});
</script>

<MetaData title={data.copy.defaultPageTitle} themeColor={pageBackgroundDefault} url={$page.url} />

<LayoutContainer>
	{#if !hasCreatedAChallenge || !currentChoodler}
		<img src={urlFor(data.copy.logo).url()} width="80%" style="margin: 3rem auto;" alt="" />

		{@html toHTML(data.copy.landing_content)}

		<Button variant="primary" colour="yellow" on:click={startGame} style="margin: 3rem auto;"
			>{data.copy.startGameButtonText}</Button
		>
	{:else}
		<div>
			<img src={urlFor(data.copy.logo).url()} width="80%" alt="" />
		</div>
		<header>
			<h3><strong>{currentChoodler.username}</strong></h3>
		</header>

		<Button variant="primary" colour="yellow" on:click={startGame} style="margin: 3rem auto;"
			>{data.copy.startGameButtonText}</Button
		>

		<nav>
			{#each navItems as navItem}
				<span
					on:click={() => {
						activeTab.set(navItem);
					}}
					class={`${navItem == $activeTab ? 'active' : ''}`}
				>
					{navItem}
				</span>
			{/each}
		</nav>

		{#if $activeTab === 'my games'}
			<section class="tabContent my-games">
				<p>My Turn</p>
				{#each myTurnGames as myTurnGame}
					<p>
						<a href={generateLinkFor(myTurnGame)} on:click={goto(generateLinkFor(myTurnGame))}
							>{otherPlayerIn(myTurnGame)} {streakCount(normalizeGame(myTurnGame))}</a
						>
					</p>
				{/each}
				<p>Their Turn</p>
				{#each theirTurnGames as theirTurnGame}
					<p>
						<a href={generateLinkFor(theirTurnGame)} on:click={goto(generateLinkFor(theirTurnGame))}
							>{otherPlayerIn(theirTurnGame)} {streakCount(normalizeGame(theirTurnGame))}</a
						>
					</p>
				{/each}
			</section>
		{/if}

		{#if $activeTab === 'rules'}
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

	.highlight {
		background: var(--choodle-yellow);
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
