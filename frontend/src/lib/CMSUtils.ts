import {createClient} from "@sanity/client";
import {PUBLIC_SANITY_DATASET, PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_TOKEN} from "$env/static/public";

export const readWriteClient = createClient({
    projectId: PUBLIC_SANITY_PROJECT_ID,
    dataset: PUBLIC_SANITY_DATASET,
    token: PUBLIC_SANITY_TOKEN,
    apiVersion: "2023-07-18",
    useCdn: false
})

export const readOnlyClient = createClient({
    projectId: PUBLIC_SANITY_PROJECT_ID,
    dataset: PUBLIC_SANITY_DATASET,
    perspective: 'published',
    apiVersion: "2023-07-18",
    useCdn: false
})

export const getChoodleById = async (choodleId) => {
    const choodles = await readOnlyClient.fetch(`*[_type == "choodle" && _id == "${choodleId}"]`)
    return choodles[0];
}
