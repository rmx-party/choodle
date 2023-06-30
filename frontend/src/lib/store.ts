import {writable} from 'svelte/store';

export const tokenId = writable(null);
export const loading = writable(false);

export const imageData = writable("");
export const nftTitle = writable("");
export const nftAlt = writable("");
export const nftDescription = writable("");
