import { getUserAuthenticators } from "$lib/server/storage";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, parent }) => {
  const { user } = await parent();
  const authenticators = getUserAuthenticators(user);
  const registrationOptions = (await fetch("/account/registration")).json();
  return {
    user,
    authenticators,
    registrationOptions,
  };
};
