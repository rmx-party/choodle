import { sequence } from "@sveltejs/kit/hooks";
import { handleErrorWithSentry, sentryHandle } from "@sentry/sveltekit";
import * as Sentry from "@sentry/sveltekit";
import { version } from "$app/environment";
import type { Handle, HandleServerError } from "@sveltejs/kit";
import { ProfilingIntegration } from "@sentry/profiling-node";
import { prisma } from "$lib/server/storage";
import { VITE_VERCEL_REGION } from "$env/static/public";

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
  _metadata: {
    vercelRegion: VITE_VERCEL_REGION,
  },
});

// handle user session by locating user from id in the session cookie and attaching it to the request
export const handleUserSession: Handle = async ({ event, resolve }) => {
  const userId = Number(event.cookies.get("userId"));
  let user = null;
  if (userId) {
    user = await prisma.user.findUnique({
      where: { id: userId },
    });
  }
  event.locals.user = user;
  return resolve(event);
};

// // If you have custom handlers, make sure to place them after `sentryHandle()` in the `sequence` function.
export const handle: Handle = sequence(sentryHandle(), handleUserSession);

// // If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError: HandleServerError = handleErrorWithSentry();
