<script lang="ts">
  import Button from '../../components/Button.svelte'
  import { readWriteClient } from '$lib/CMSUtils'
  import { onMount } from 'svelte'
  import { loading } from '$lib/store'
  import { reject, uniqBy } from 'lodash/fp'

  const queries = {
    choodle: `*[_type == "choodle"]`,
    cwfgame: `*[_type == "cwfgame"]`,
    challenge: `*[_type == "challenge"]`,
    guess: `*[_type == "guess"]`,
    creator: `*[_type == "creator"]`,
  }
  const records = {
    choodle: [],
    cwfgame: [],
    challenge: [],
    guess: [],
    creator: [],
  }

  const deleteAll = async (type) => {
    records[type] = await readWriteClient.fetch(queries[type])
    for (const { _id } of records[type]) {
      await deleteOne(_id)
    }
  }

  const deleteOne = async (id) => {
    try {
      await readWriteClient.delete(id)
    } catch (e) {
      console.log(`error deleting ${id}`, e.message)
      const related = await readWriteClient.fetch(`*[references("${id}")]`)
      console.log(`trying to delete related items`, related)
      related.forEach(async (item) => {
        console.log(`unsetting refs from`, item)

        await readWriteClient
          .patch(item._id)
          .unset([
            'challenge',
            'currentChallenge',
            'creator',
            'guesser',
            'challenger',
            'gameRef',
            'gamePromptRef',
            'guessResults',
            'choodle',
            'player1',
            'player2',
          ])
          .commit()
      })
      console.log(`retrying delete of ${id}`)
      await deleteOne(id)
    }
  }

  onMount(async () => {
    ;['challenge', 'choodle', 'cwfgame', 'guess', 'creator'].forEach(async (type) => {
      await readWriteClient.fetch(queries[type]).then((items) => (records[type] = items))
      readWriteClient
        .listen(queries[type], {}, { includePreviousRevision: true })
        .subscribe((update) => {
          console.log(queries[type], { update })
          if (update.result) {
            records[type] = uniqBy('_id', [...records[type], update.result])
          } else if (update.previous) {
            records[type] = uniqBy('_id', reject({ _id: update.previous?._id }, records[type]))
          }
        })
    })

    loading.set(false)
  })
</script>

<div>
  <Button on:click={() => deleteAll('choodle')}
    >Delete All {records['choodle']?.length || 0} Choodles</Button
  >
  <Button on:click={() => deleteAll('cwfgame')}
    >Delete All {records['cwfgame']?.length || 0} Games</Button
  >
  <Button on:click={() => deleteAll('challenge')}
    >Delete All {records['challenge']?.length || 0} Challenges</Button
  >
  <Button on:click={() => deleteAll('guess')}
    >Delete All {records['guess']?.length || 0} Guesses</Button
  >
  <Button on:click={() => deleteAll('creator')}
    >Delete All {records['creator']?.length || 0} Creators</Button
  >
</div>
