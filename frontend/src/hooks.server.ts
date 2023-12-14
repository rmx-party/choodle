import { sequence } from "@sveltejs/kit/hooks";
import { handleErrorWithSentry, sentryHandle } from "@sentry/sveltekit";
import * as Sentry from "@sentry/sveltekit";
import { version } from "$app/environment";
import type { Handle, HandleServerError } from "@sveltejs/kit";
import { ProfilingIntegration } from "@sentry/profiling-node";
import { getUser, prisma } from "$lib/server/storage";
import type { User } from "@prisma/client";

console.log(`server hooks initializing: choodle@${version}`);

Sentry.init({
  release: `choodle@${version}`,
  dsn:
    "https://6396667f7493703c96bed4717a086c02@o4506125009813504.ingest.sentry.io/4506125012762624",
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0, // Profiling sample rate is relative to tracesSampleRate
  integrations: [
    // Add profiling integration to list of integrations
    new ProfilingIntegration(),
    new Sentry.Integrations.Prisma({ client: prisma }),
  ],
});

// handle user session by locating user from id in the session cookie and attaching it to the request
export const handleUserSession: Handle = async ({ event, resolve }) => {
  let user: User | null = null;
  const userId = Number(event.cookies?.get("userId"));

  if (userId) {
    user = await getUser(userId);
  }
  event.locals.user = user;
  return resolve(event);
};

// // If you have custom handlers, make sure to place them after `sentryHandle()` in the `sequence` function.
export const handle: Handle = sequence(sentryHandle(), handleUserSession);

// // If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError: HandleServerError = handleErrorWithSentry();
