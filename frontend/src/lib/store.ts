import { type Writable, writable } from "svelte/store";

export const uncaughtErrors: Writable<unknown[]> = writable([]);

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

export const tokenId: Writable<number> = writable(0);
export const loading: Writable<boolean> = writable(true);
export const isOnline: Writable<boolean> = writable(true);

export const filterState: Writable<string> = writable("all");
