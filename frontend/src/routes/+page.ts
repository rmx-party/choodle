import {cachedReadOnlyClient} from "$lib/CMSUtils";

export async function load({params}) {
  return {
    howto: cachedReadOnlyClient.fetch(`*[_type == "howto"] | order(_createdAt) [0]`)
  };
}
