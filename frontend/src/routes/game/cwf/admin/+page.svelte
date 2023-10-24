<script lang="ts">
  import Button from "../../../../components/Button.svelte";
  import {readOnlyClient, readWriteClient} from "$lib/CMSUtils";

  const deleteAllGames = async () => {
    const challenges: any[] = await readOnlyClient.fetch('*[_type == "challenge"]')

    for (const challenge of challenges) {
      await readWriteClient.patch(challenge._id).unset(['gameRef']).commit()
    }

    await readWriteClient.delete({query: '*[_type == "cwfgame"]'})
  }

  const deleteAllChallenges = async () => {
    await readWriteClient.delete({query: '*[_type == "challenge"]'})
  }

  const deleteAllGuesses = async () => {
    const challenges: any[] = await readOnlyClient.fetch('*[_type == "challenge"]')

    for (const challenge of challenges) {
      await readWriteClient.patch(challenge._id).unset(['gameRef']).commit()
    }

    await readWriteClient.delete({query: '*[_type == "guess"]'})
  }
</script>

<div>
  <Button on:click={deleteAllGames}>Delete All Games</Button>
  <Button on:click={deleteAllChallenges}>Delete All Challenges</Button>
  <Button on:click={deleteAllGuesses}>Delete All Guesses</Button>
</div>
