import {readOnlyClient} from "$lib/CMSUtils";
import { loading } from "$lib/store";

export async function load({params}) {
  loading.set(true)

  return {
    copy: readOnlyClient.fetch(`*[_type == "choodleWithFriendsCopy" && gameName  == "defcon"] | order(_createdAt) [0]`),
    choodle: readOnlyClient.fetch(`*[_type == "choodle" && _id == "${params.id}"] [0]`)
  };
}
