import { browser } from "$app/environment";

export type Shareable = {
  text: string;
  files?: File[];
  title?: string;
  url?: string;
};

export let copiedToClipboard = false;

export const canShare = (shareable: Shareable): boolean => {
  if (!browser) return false;
  if (!navigator.share) return false;

  return navigator.canShare(shareable);
};

export const share = async (
  shareable: Shareable,
  callback: (usedClipboard: boolean) => void,
) => {
  if (!browser) return;
  console.log(`sharing:`, shareable);

  if (canShare(shareable)) {
    console.log("Thanks for sharing!");
    navigator.share(shareable);
  } else {
    console.log(`copied "${shareable.text}" to clipboard`);
    await navigator.clipboard.writeText(shareable.text);
    copiedToClipboard = true;
  }
  callback(copiedToClipboard);
};
