import { writable } from "svelte/store";

export const uncaughtErrors = writable([]);

export type DialogState = {
  [domId: string]: boolean;
};
export const dialogState = writable<DialogState>({});
export const switchDialog = (id: string, open: boolean) => {
  dialogState.update((dialogs) => {
    return { ...dialogs, [id]: open };
  });
};
export const openDialog = (id) => switchDialog(id, true);
export const closeDialog = (id) => switchDialog(id, false);

export const tokenId = writable(0);
export const loading = writable(true);
export const loadingMessage = writable("");
export const isOnline = writable(true);

export const imageData = writable("");
export const nftTitle = writable("");
export const nftAlt = writable("");
export const nftDescription = writable("");

export const filterState = writable("all");
