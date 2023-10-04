import {browser} from "$app/environment";
import localforage from "localforage";
import {choodleCreatorEmailKey, choodleCreatorIdKey, choodleCreatorUsernameKey} from "$lib/Configuration";
import {readOnlyClient} from "$lib/CMSUtils";

export async function getDeviceId(): Promise<string> {
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

export async function getEmail(): Promise<string | undefined> {
  if (!browser) return;
  try {
    const existingEmail = await localforage.getItem(choodleCreatorEmailKey);
    if (existingEmail && existingEmail.length > 1) {
      return existingEmail
    }
  } catch (e) {
    return undefined
  }
}

export async function getUsername(): Promise<string | undefined> {
  if (!browser) return;
  try {
    const existingUsername = await localforage.getItem(choodleCreatorUsernameKey);
    if (existingUsername && existingUsername.length > 1) {
      return existingUsername
    }
  } catch (e) {
    return undefined
  }
}


export const locateCreator = async ({username, deviceId, email}: {
  username: string | undefined,
  deviceId: string | undefined,
  email: string | undefined
}) => {
  let query = `*[_type == "creator"][deviceIds match "${deviceId}"`
  if (email) {
    query += ` || email match "${email}"`
  }
  if (username) {
    query += ` || username match "${username}"`
  }
  query += "]"
  return (await readOnlyClient.fetch(query))[0]
}

