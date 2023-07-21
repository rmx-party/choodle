import imageUrlBuilder from '@sanity/image-url'
import {readWriteClient} from "$lib/CMSUtils";

// Get a pre-configured url-builder from your sanity client
export const builder = imageUrlBuilder(readWriteClient)

// Then we like to make a simple function like this that gives the
// builder an image and returns the builder for you to specify additional
// parameters:
export function urlFor(source) {
    return builder.image(source)
}
