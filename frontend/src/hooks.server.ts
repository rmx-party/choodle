import { sequence } from "@sveltejs/kit/hooks";
import { handleErrorWithSentry, sentryHandle } from "@sentry/sveltekit";
import * as Sentry from "@sentry/sveltekit";
import { version } from "$app/environment";
// import { ProfilingIntegration } from "@sentry/profiling-node";

console.log(`server hooks initializing: choodle@${version}`);

Sentry.init({
  release: `choodle@${version}`,
  dsn:
    "https://6396667f7493703c96bed4717a086c02@o4506125009813504.ingest.sentry.io/4506125012762624",
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0, // Profiling sample rate is relative to tracesSampleRate
  // integrations: [
  //   // Add profiling integration to list of integrations
  //   new ProfilingIntegration(),
  // ],
});
//
// // If you have custom handlers, make sure to place them after `sentryHandle()` in the `sequence` function.
export const handle = sequence(sentryHandle());
//
// // If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
