import {createClient} from "@sanity/client";
import imageUrlBuilder from '@sanity/image-url'
import {PUBLIC_SANITY_PROJECT_ID} from "$env/static/public";
import {PUBLIC_SANITY_DATASET} from "$env/static/public";
import {PUBLIC_SANITY_TOKEN} from "$env/static/public";

export const client = createClient({
    projectId: PUBLIC_SANITY_PROJECT_ID,
    dataset: PUBLIC_SANITY_DATASET,
    token: PUBLIC_SANITY_TOKEN,
    apiVersion: "2023-07-18",
    useCdn: false
})

// Get a pre-configured url-builder from your sanity client
export const builder = imageUrlBuilder(client)

// Then we like to make a simple function like this that gives the
// builder an image and returns the builder for you to specify additional
// parameters:
export function urlFor(source) {
    return builder.image(source)
}
