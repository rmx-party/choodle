import {writable} from 'svelte/store';

export const tokenId = writable(0);
export const loading = writable(false);
export const loadingMessage = writable('');

export const imageData = writable("");
export const nftTitle = writable("");
export const nftAlt = writable("");
export const nftDescription = writable("");

export const filterState = writable('all');
