import { browser } from '$app/environment'
import localforage from 'localforage'
import { choodleCreatorIdKey, choodleCreatorUsernameKey } from '$lib/Configuration'
import { readOnlyClient, readWriteClient } from '$lib/CMSUtils'

export async function getDeviceId(): Promise<string> {
  if (!browser) return
  try {
    const existingId = await localforage.getItem(choodleCreatorIdKey)
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

export async function getUsername(): Promise<string | undefined> {
  if (!browser) return
  try {
    const existingUsername = await localforage.getItem(choodleCreatorUsernameKey)
    if (existingUsername && existingUsername.length > 1) {
      return existingUsername
    }
  } catch (e) {
    return undefined
  }
}

export const locateCreator = async ({
  username,
  deviceId,
}: {
  username?: string | undefined
  deviceId?: string | undefined
}) => {
  if (!deviceId) {
    deviceId = await getDeviceId()
  }
  if (!username) {
    username = await getUsername()
  }
  console.log(`locateCreator: ${deviceId} ${username}`)
  let query = `*[_type == "creator"]`
  if (deviceId && deviceId.length > 0) {
    query += `[deviceIds match "${deviceId}"`
  }
  if (username && username.length > 0) {
    query += ` || username match "${username}"`
  }
  query += ']'
  let creator = (await readOnlyClient.fetch(query))[0]
  // TODO: if there are multiple matches, we should consolidate them
  // TODO: if creator is in the backend, store the ID in browser so we don't have to keep asking on every page
  // TODO: track changes to the creator through a store and subscribe to storage events to keep it fully synced

  if (creator) {
    const patch = readWriteClient.patch(creator._id).setIfMissing({ deviceIds: [] })

    if (deviceId && deviceId.length > 0 && !creator.deviceIds.includes(deviceId)) {
      patch.append('deviceIds', [deviceId])
    }

    if (username && username.length > 0) {
      patch.set({ username })
    }

    creator = await patch.commit({ autoGenerateArrayKeys: true })
  } else {
    creator = await readWriteClient.create(
      {
        _type: 'creator',
        username,
        deviceIds: [deviceId],
        choodles: [],
      },
      { autoGenerateArrayKeys: true }
    )
  }
  console.log({ creator })
  return creator
}
