import {readOnlyClient} from "$lib/CMSUtils";

export async function load({params}) {
  const copy = await readOnlyClient.fetch(`*[_type == "choodleWithFriendsCopy" && gameName  == "defcon"] | order(_createdAt) [0]`)
  const choodle = await readOnlyClient.fetch(`*[_type == "choodle" && _id == "${params.id}"] [0]`);

  if (choodle) return {copy, choodle};

  return {
    status: 500,
    body: new Error("Internal Server Error")
  };
}
