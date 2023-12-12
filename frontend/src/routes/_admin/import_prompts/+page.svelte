<script lang="ts">
  import { readWriteClient } from '$lib/CMSUtils'
  import Papa from 'papaparse'
  import map from 'lodash/fp/map'
  import pickBy from 'lodash/fp/pickBy'
  import flow from 'lodash/fp/flow'
  import mapKeys from 'lodash/fp/mapKeys'

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
      map((row) => {
        return {
          ...row,
          _id: row['id'],
          _type: 'gamePrompt',
          category: {
            _type: 'reference',
            _ref: categoryRef,
          },
        }
      })
    )(parsedData)
  }

  const handleFileSelect = (event: Event) => {
    csvFile = event?.target?.files[0]
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      transformHeader,
      transform,
      preview: 10,
      complete: (results) => {
        console.log({ results })
        parsedData = results.data
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

  // Import CSV data to Sanity
  async function importToSanity() {
    return null // TODO: test this out before running it
    // TODO: observe included headers
    // TODO: ensure stable IDs
    // parsedData.forEach(async (doc) => {
    //   await readWriteClient.createOrReplace(doc)
    // })
  }
</script>

<h1>Import CSV Prompts to Sanity</h1>

<input type="file" on:change={handleFileSelect} />
<label>
  Category Ref:
  <input type="text" bind:value={categoryRef} />
</label>

<button on:click={importToSanity}>Import to Sanity</button>

<hr />

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
            <pre>
              {JSON.stringify(includedData[i], null, 2)}
            </pre>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<style>
  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 0.75rem;
    letter-spacing: -0.05rem;
  }

  thead {
    border-bottom: 2px solid black;
  }

  input {
    width: 100%;
    font-size: 0.75rem;
  }

  th,
  td {
    padding: 0.2rem;
  }
  th.excluded,
  td.excluded {
    background: #eee;
  }

  td pre {
    max-height: 10rem;
    overflow: auto;
    font-size: 0.5rem;
    line-height: 0.6rem;
    letter-spacing: -0.05rem;
  }
</style>
