import imageUrlBuilder from "@sanity/image-url";
import { cachedReadOnlyClient } from "$lib/CMSUtils";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

// Get a pre-configured url-builder from your sanity client
export const builder = imageUrlBuilder(cachedReadOnlyClient);

// Then we like to make a simple function like this that gives the
// builder an image and returns the builder for you to specify additional
// parameters:
export const urlFor = (source: SanityImageSource) => {
  return builder.image(source);
};
