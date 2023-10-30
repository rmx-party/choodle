import {readOnlyClient} from "$lib/CMSUtils";
import fp from "lodash/fp.js";

export async function load({params}) {
  const copy = await readOnlyClient.fetch(`*[_type == "choodleWithFriendsCopy"] | order(_createdAt) [0]`)
  const records = fp.shuffle(await readOnlyClient.fetch(`*[_type == "gamePrompt"]`));

  if (records) {
    console.log({records})
    return {
      copy: copy,
      records
    };
  }
  return {
    status: 500,
    body: new Error("Internal Server Error")
  };
}
