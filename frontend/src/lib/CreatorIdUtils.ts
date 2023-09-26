import {browser} from "$app/environment";
import localforage from "localforage";
import {choodleCreatorIdKey} from "$lib/Configuration";

export async function getCreatorId() {
    if (!browser) return;
    try {
        const existingId = await localforage.getItem(choodleCreatorIdKey);
        if (existingId && existingId.length > 1) {
            return existingId
        }

        const uuid = window.crypto.randomUUID()
        await localforage.setItem(choodleCreatorIdKey, uuid)
        return uuid
    } catch (e) {
        console.error(`getCreatorId failure, returning 'unknown'`, e)
        return 'unknown'
    }
}
