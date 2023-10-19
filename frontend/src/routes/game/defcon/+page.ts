import {readOnlyClient} from "$lib/CMSUtils";
import { loading } from "$lib/store";

export async function load({params}) {
  loading.set(true)

  return {
    copy: readOnlyClient.fetch(`*[_type == "choodleWithFriendsCopy" && gameName  == "defcon"] | order(_createdAt) [0]`),
    challenges: readOnlyClient.fetch(`*[_type == "challenge" && game == "defcon"]{..., choodle, challenger->{username}} | order(_createdAt desc)`)
  }
}
