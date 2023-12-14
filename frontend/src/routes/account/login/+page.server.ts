import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, parent }) => {
  const { user } = await parent();
  const authenticationOptions = (await fetch("/account/login")).json(); // TODO: invalidate this client side when challenge expires etc
  return {
    user,
    authenticationOptions,
  };
};
