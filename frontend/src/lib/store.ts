import { browser } from "$app/environment";
import { navigating } from "$app/stores";
import compact from "lodash/fp/compact";
import { derived, get, type Writable, writable } from "svelte/store";

// Array of unhandled errors, used to display an error page which resets the app
export const uncaughtErrors: Writable<unknown[]> = writable([]);

// Map of dialog ids to open/closed state
export type DialogState = {
  [domId: string]: boolean;
};
export const dialogState: Writable<DialogState> = writable<DialogState>({});
export const switchDialog = (id: string, open: boolean) => {
  dialogState.update((dialogs) => {
    return { ...dialogs, [id]: open };
  });
};
export const openDialog = (id: string) => switchDialog(id, true);
export const closeDialog = (id: string) => switchDialog(id, false);

const loadingTimeMax = 15000;
export const loadingTimeoutId: Writable<string | number | undefined> =
  writable();

export const loading: Writable<boolean> = writable(true);
export const loadingOverride: Writable<boolean> = writable(false);

const expireLoadingState = () => {
  // TODO: this probably indicates some error occurred that was uncaught, user should be given useful feedback
  console.info(`expireLoadingState: ${loadingTimeMax}ms timeout expired`);
  loading.set(false);
  loadingTimeoutId.set(undefined);
};
loading.subscribe(async (isLoading) => {
  if (!browser) return;
  const existingTimeoutId = get(loadingTimeoutId);

  if (isLoading) {
    const newTimeOutId = window.setTimeout(expireLoadingState, loadingTimeMax);
    loadingTimeoutId.set(newTimeOutId);
  } else {
    window.clearTimeout(existingTimeoutId);
  }
});

export const loadingReasons = writable(new Map());
export const addLoadingReason = async (
  label: string,
  promise?: Promise<unknown>,
) => {
  loadingReasons.update((reasons) => {
    const wrappedPromise = promise?.catch((err) => {
      uncaughtErrors.update((errors) => [...errors, err]);
    }).finally(() => removeLoadingReason(label));
    reasons.set(label, wrappedPromise);
    return reasons;
  });
  return promise;
};
export const removeLoadingReason = async (label) => {
  loadingReasons.update((reasons) => {
    console.log(`removeLoadingReason`, { label, reasons });
    reasons.delete(label);
    return reasons;
  });
};
export const clearLoadingReasons = async () => {
  loadingReasons.set(new Map());
};
loadingReasons.subscribe(async (reasons) => {
  console.log(`loadingReasons: ${reasons.size}`, { reasons });
});

export const showLoadingIndicator = derived([
  navigating,
  loading,
  loadingReasons,
], ([isNav, isLoad, reasons]) => {
  return compact([isNav, isLoad, reasons.size]).length > 0;
});

export const isOnline: Writable<boolean> = writable(true);
