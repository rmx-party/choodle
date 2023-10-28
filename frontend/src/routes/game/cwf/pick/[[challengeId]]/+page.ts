import {cachedReadOnlyClient, readOnlyClient} from "$lib/CMSUtils";

export async function load({params}) {
  return {
    copy: cachedReadOnlyClient.fetch(`*[_type == "choodleWithFriendsCopy"] | order(_createdAt) [0]`),
    records: cachedReadOnlyClient.fetch(`*[_type == "gamePrompt"]`)
  };
}
