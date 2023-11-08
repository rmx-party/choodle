import { readOnlyClient } from '$lib/CMSUtils'

export async function load({ params }) {
  const challenge = await readOnlyClient.fetch(
    `*[_type == "challenge" && _id == "${params.challengeId}"]{..., challenger->{...}, choodle->{...}, gamePrompt->{...}} [0]`
  )

  return { challenge }
}
