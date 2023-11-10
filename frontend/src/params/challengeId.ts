import type { ParamMatcher } from "@sveltejs/kit";

export const match: ParamMatcher = (param) => {
  return /^\/challenge-.+$/gi.test(param);
};
