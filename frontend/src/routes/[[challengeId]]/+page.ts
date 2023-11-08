import { cachedReadOnlyClient, readOnlyClient } from '$lib/CMSUtils'
import fp from 'lodash/fp.js'
import { error } from '@sveltejs/kit'

export async function load({ params }) {
  let challenge
  if (params.challengeId) {
    if (!params.challengeId.startsWith('challenge-')) {
      throw error(404)
    }

    challenge = await readOnlyClient.fetch(
      `*[_type == "challenge" && _id == "${params.challengeId}"][0]`
    )

    if (!challenge) {
      throw error(404)
    }
  }

  return {
    records: fp.shuffle(await cachedReadOnlyClient.fetch(`*[_type == "gamePrompt"]`)),
    challenge,
  }
}
