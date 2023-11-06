<script lang="ts">
  import Button from '../../../../components/Button.svelte';
  import {readOnlyClient, readWriteClient} from '$lib/CMSUtils';
  import {onMount} from 'svelte';
  import {loading} from '$lib/store';

  let gameCount = 0;
  let challengeCount = 0;
  let guessCount = 0;
  let pointCount = 0;
  let creatorCount = 0;

  const deleteAllGames = async () => {
    const games = await readWriteClient.fetch('*[_type == "cwfgame"]');
    gameCount = games.length;
    console.log({gameCount});
    for (const game of games) {
      await readWriteClient.delete({query: `*[references("${game._id}")]`});
      await readWriteClient.delete(game._id);
      gameCount--;
    }
  };

  const deleteAllChallenges = async () => {
    const challenges: any[] = await readOnlyClient.fetch('*[_type == "challenge"]');
    challengeCount = challenges.length;
    console.log({challengeCount});
    for (const challenge of challenges) {
      await readWriteClient.delete({query: `*[references("${challenge._id}")]`});
      await readWriteClient.delete(challenge._id);
      challengeCount--;
    }
  };

  const deleteAllGuesses = async () => {
    const guesses = await readWriteClient.fetch('*[_type == "guess"]');
    guessCount = guesses.length;
    console.log({guessCount});
    for (const guess of guesses) {
      try {
        await readWriteClient.delete({query: `*[references("${guess._id}")]`});
        await readWriteClient.delete(guess._id);
        guessCount--;
      } catch (e) {
        console.error(e);
      }
    }
  };

  const deleteAllPoints = async () => {
    const points = await readWriteClient.fetch('*[_type == "points"]');
    pointCount = points.length;
    console.log({points});
    for (const point of points) {
      await readWriteClient.delete({query: `*[references("${point._id}")]`});
      await readWriteClient.delete(point._id);
      pointCount--;
    }
  };

  const deleteAllCreators = async () => {
    const creators = await readWriteClient.fetch('*[_type == "creator"]');
    creatorCount = creators.length;
    console.log({creators});
    for (const creator of creators) {
      await readWriteClient.delete({query: `*[references("${creator._id}")]`});
      await readWriteClient.delete(creator._id);
      creatorCount--;
    }
  };

  onMount(() => {
    loading.set(false);
  });
</script>

<div>
  <Button on:click={deleteAllGames}>Delete All {gameCount} Games</Button>
  <Button on:click={deleteAllChallenges}>Delete All {challengeCount} Challenges</Button>
  <Button on:click={deleteAllGuesses}>Delete All {guessCount} Guesses</Button>
  <Button on:click={deleteAllPoints}>Delete All {pointCount} Points</Button>
  <Button on:click={deleteAllCreators}>Delete All {creatorCount} Creators</Button>
</div>
