import { dev, version } from "$app/environment";
import { handleChoodleClientError } from "$lib/errorHandling";
import { handleErrorWithSentry, Replay } from "@sentry/sveltekit";
import * as Sentry from "@sentry/sveltekit";
import type { HandleClientError } from "@sveltejs/kit";

console.log(`client hooks initializing: choodle@${version}`);

Sentry.init({
  release: `choodle@${version}`,
  dsn:
    "https://6396667f7493703c96bed4717a086c02@o4506125009813504.ingest.sentry.io/4506125012762624",
  tracesSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // If you don't want to use Session Replay, just remove the line below:
  integrations: [new Replay()],
  environment: dev ? "development" : "production",
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError: HandleClientError = handleErrorWithSentry(
  handleChoodleClientError,
);
