import { browser } from '$app/environment'
import localforage from 'localforage'
import { choodleCreatorIdKey } from '$lib/Configuration'
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

export const locateCreator = async ({ deviceId }: { deviceId?: string | undefined }) => {
  if (!deviceId) {
    deviceId = await getDeviceId()
  }
  console.log(`locateCreator: ${deviceId}`)
  let query = `*[_type == "creator"]`
  if (deviceId && deviceId.length > 0) {
    query += `[deviceIds match "${deviceId}"`
  }
  query += ']'
  let creator = (await readOnlyClient.fetch(query))[0]

  if (!creator) {
    creator = await readWriteClient.create(
      {
        _type: 'creator',
        deviceIds: [deviceId],
        choodles: [],
      },
      { autoGenerateArrayKeys: true }
    )
  }

  console.log({ creator })
  return creator
}
