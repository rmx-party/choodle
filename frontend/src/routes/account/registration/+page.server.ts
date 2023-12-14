import map from "lodash/fp/map";
import { getUserAuthenticators } from "$lib/server/storage";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, parent }) => {
  const { user } = await parent();
  const authenticators = map(
    (fido) => ({
      ...fido,
      counter: fido.counter.toString(),
      credentialPublicKey: fido.credentialPublicKey.toString("base64"),
    }),
    await getUserAuthenticators(user),
  );
  const registrationOptions = (await fetch("/account/registration")).json();
  return {
    user,
    authenticators,
    registrationOptions,
  };
};
