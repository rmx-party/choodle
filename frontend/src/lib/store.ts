import {writable} from 'svelte/store';

export const tokenId = writable(0);
export const loading = writable(false);
export const debugEnabled = writable(false);
export const debugInfo = writable("Debug.");

export const imageData = writable("");
export const nftTitle = writable("");
export const nftAlt = writable("");
export const nftDescription = writable("");
