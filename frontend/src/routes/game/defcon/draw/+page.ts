import {readOnlyClient} from "$lib/CMSUtils";

export async function load({params}) {
  const copy = await readOnlyClient.fetch(`*[_type == "choodleWithFriendsCopy" && gameName  == "defcon"] | order(_createdAt) [0]`)

  if (copy) {
    return {copy};
  }
  return {
    status: 500,
    body: new Error("Internal Server Error")
  };
}
