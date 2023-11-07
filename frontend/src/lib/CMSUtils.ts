import {type ClientConfig, createClient} from "@sanity/client";
import {
  PUBLIC_SANITY_DATASET,
  PUBLIC_SANITY_PROJECT_ID,
  PUBLIC_SANITY_TOKEN,
} from "$env/static/public";

const baseConfig: ClientConfig = {
  projectId: PUBLIC_SANITY_PROJECT_ID,
  dataset: PUBLIC_SANITY_DATASET,
  token: PUBLIC_SANITY_TOKEN,
  apiVersion: "2023-07-18",
};
export const readWriteClient = createClient({
  ...baseConfig,
  useCdn: false,
});

export const readOnlyClient = createClient({
  ...baseConfig,
  useCdn: false,
});

export const cachedReadOnlyClient = createClient({
  ...baseConfig,
  useCdn: true,
  perspective: "published",
});
