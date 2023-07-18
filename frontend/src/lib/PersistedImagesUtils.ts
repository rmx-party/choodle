import {createClient} from "@sanity/client";
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
    projectId: "tdnjp9se",
    dataset: "production",
    token: "sk1P3LdFayn1WzYlZjUNEyuHR276OEnwQO2EvN2L8Yi34VlvjWa8QsZkYUQaYuWElO7sgtz2iMECjptmzjqoqcLCIbPNU5Lfb2c9Cdczf1D9M7IBozgfmJ4nJmZVZIQWIAbvC4N7Lhmu8altZ9ENaxQAEI7XzhD4c6ohjiGKo6u4qvTFRzQl",
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
