import {readOnlyClient} from "$lib/CMSUtils";
import { loading } from "$lib/store";

export async function load({params}) {
  loading.set(true)
  return {
    howto: readOnlyClient.fetch(`*[_type == "howto"] | order(_createdAt) [0]`)
  };
}
