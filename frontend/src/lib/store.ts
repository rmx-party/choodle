import {writable} from 'svelte/store';

export const tokenId = writable(null);
export const loading = writable(false);
export const imageData = writable("");
