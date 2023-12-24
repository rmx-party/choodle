<script lang="ts">
  import { readWriteClient } from '$lib/CMSUtils'
  import Papa from 'papaparse'
  import map from 'lodash/fp/map'
  import pickBy from 'lodash/fp/pickBy'
  import flow from 'lodash/fp/flow'
  import mapKeys from 'lodash/fp/mapKeys'
  import reject from 'lodash/fp/reject'
  import filter from 'lodash/fp/filter'
  import compact from 'lodash/fp/compact'

  let csvFile
  let parsedData: Record<string, string>[] = []
  let includedData: any[] = []
  let headersMap: Record<string, { original: string; updated: string; included: boolean }> = {}
  let categoryRef: string

  // TODO: add a field to specify the category ref
  // TODO: use updated header values
  // TODO: exclude invalid records / empty prompts etc.
  // TODO: assign a stable sanity ID
  $: {
    includedData = flow(
      map(pickBy((_value, header) => headersMap[header]['included'])),
      map(
        pickBy((_value, header) => {
          return headersMap[header]['included']
        })
      ),
      map(mapKeys((key) => headersMap[key]['updated'])),
      map(generateHint2),
      map(generateHint3),
      map((row) => {
        if (!validForSanity(row)) return null

        const sanityDoc = {
          ...row,
          _type: 'gamePrompt',
          category: {
            _type: 'reference',
            _ref: categoryRef,
          },
        }
        const excludeKeys = ['invalid_reason']

        return pickBy((_value, key) => !excludeKeys.includes(key))(sanityDoc)
      })
    )(parsedData)
  }

  const validForSanity = (row) => {
    if (!row['prompt']?.trim().length) return false

    if (row['invalid_reason']?.trim().length) return false

    return true
  }

  const handleFileSelect = (event: Event) => {
    csvFile = event?.target?.files[0]
    if (!csvFile) return
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      transformHeader,
      transform,
      complete: (results) => {
        console.log({ results })
        parsedData = reject((row) => {
          return Object.values(row).every((value) => value.trim() === '')
        })(results.data)
      },
    })
  }

  const transformHeader = (orig: string) => {
    headersMap[orig] = {
      original: orig,
      updated: orig,
      included: false,
    }
    return orig
  }
  const transform = (value: string, header: string) => {
    return value
  }

  async function importToSanity() {
    console.log(`importing ${includedData.length} prompts to Sanity`)
    for (const doc of compact(includedData)) {
      await updateOrCreateInSanity(doc)
    }
    console.log('all done')
  }

  const updateOrCreateInSanity = async (doc) => {
    console.log(`querying for ${doc.prompt}`)
    const existing = await readWriteClient.fetch(
      `*[_type == "gamePrompt" && prompt == "${doc.prompt.trim()}"]`
    )

    const { cut, ...restDoc } = doc

    if (existing.length) {
      console.log(`updating ${existing[0]._id}`, existing)

      if (cut === '✂️ Cut') {
        console.log(`deleting ${existing[0]._id} ${doc.prompt}`)
        return await readWriteClient.delete(existing[0]._id)
      }

      return await readWriteClient.patch(existing[0]._id).set(restDoc).commit()
    } else {
      if (doc['cut'] === '✂️ Cut') {
        console.log(`skipping ${doc.prompt}`)
        return
      }

      console.log(`creating ${doc.prompt}`)
      return await readWriteClient.create(restDoc)
    }
  }

  const generateHint2 = (row) => {
    const prompt = row['prompt']
    if (!prompt) return row

    row['hint_2'] = `The theme is: ${row['hint_2']}`
    return row
  }
  const generateHint3 = (row) => {
    const prompt = row['prompt']
    if (!prompt) return row

    row['hint_3'] = `The first letter is: ${prompt[0]?.toUpperCase()}`
    return row
  }
</script>

<header>
  <h1>Import CSV Prompts to Sanity</h1>

  <input type="file" on:change={handleFileSelect} />
  <label>
    Category Ref:
    <input type="text" bind:value={categoryRef} />
  </label>

  <button on:click={importToSanity}>Import to Sanity</button>
</header>

{#if parsedData.length > 0}
  <table>
    <thead>
      <tr>
        {#each Object.keys(headersMap) || [] as header, i}
          <th class={`${i} ${headersMap[header]['included'] ? 'included' : 'excluded'}`}>
            <span>
              {header}
            </span>
            <input type="text" bind:value={headersMap[header]['updated']} />
            <label
              >include: <input
                type="checkbox"
                bind:checked={headersMap[header]['included']}
              /></label
            >
          </th>
        {/each}
        <th>To Import</th>
      </tr>
    </thead>
    <tbody>
      {#each parsedData as row, i}
        <tr class={`${i}`}>
          {#each Object.values(row) as cell, i}
            <td
              class={`${i} ${
                headersMap[Object.keys(row)[i]]['included'] ? 'included' : 'excluded'
              }`}>{cell}</td
            >
          {/each}
          <td>
            <details>
              <summary>{includedData[i]?.['prompt']}</summary>

              <pre>
              {JSON.stringify(includedData[i], null, 2)}
            </pre>
            </details>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<style>
  header,
  table {
    text-align: left;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    overflow: auto;
    font-size: 0.75rem;
    letter-spacing: -0.05rem;
  }

  thead {
    border-bottom: 2px solid black;
    position: sticky;
    top: 0;
  }

  input {
    width: 100%;
    max-width: 100%;
    font-size: 0.75rem;
  }

  th,
  td {
    padding: 0.2rem 0.5rem;
    overflow: scroll-x;
    max-width: 30ch;
    max-height: 2em;
  }
  th,
  td {
    background: hsla(120, 75%, 60%, 0.9);
    color: black;
  }
  th.excluded,
  td.excluded {
    background: hsla(320, 0%, 70%, 0.8);
    color: hsla(320, 0%, 20%, 0.8);
  }

  td pre {
    max-height: 8rem;
    overflow: auto;
    font-size: 0.5rem;
    line-height: 0.6rem;
    letter-spacing: -0.05rem;
  }
</style>
