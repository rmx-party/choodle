import type { HandleClientError } from "@sveltejs/kit";
import { uncaughtErrors } from "./store";

export const handleChoodleUncaughtError = (event: Event) => {
  console.info("handleChoodleUncaughtError", { event });
  handleChoodleClientError({ error: event.error, event });
};

export const handleChoodleClientError: HandleClientError = (
  { error, event },
) => {
  uncaughtErrors.update((errors) => [...errors, { error, event }]);
  console.info("handleChoodleClientError", { error, event });
  return {
    message: `Congrats, you found a bug 🐛\n ${error?.message}`,
  };
};
