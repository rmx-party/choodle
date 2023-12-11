<script lang="ts">
  import type { SanityDocument } from '@sanity/client'

  type PromptCategory = SanityDocument & {
    label: string
  }

  export let categories: PromptCategory[] = []
  export let disabled: boolean = !categories.length
  export let selectedCategoryId: string | undefined = categories[0]?._id
</script>

<select bind:value={selectedCategoryId} {disabled} {...$$restProps}>
  {#each categories as category (category._id)}
    <option value={category._id}>{category.label}</option>
  {/each}
</select>

<style>
  select {
    border: none;
    /* appearance: none; */
    color: #141518;
    font-family: DejaVu Sans;
    font-size: 17px;
    font-weight: 590;
    line-height: 22px;
    word-wrap: break-word;
    border-radius: 0.75rem;
    background: var(--colors-brand-white, #fff);
    box-shadow: 0px 0px 32px 0px rgba(0, 0, 0, 0.12);
    backdrop-filter: blur(75px);
    height: 3.5rem;
    padding: 0rem 1rem;
    align-items: center;
    gap: 0.0625rem;
    align-self: stretch;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap;
  }
  select:after {
    background: blue;
    display: block;
    width: 24px;
    height: 24px;
    content: '⯆';
    font-size: 24px;
    outline: 5px solid black;
  }
  option {
    flex: 1 1 0;
    align-self: stretch;
    color: #141518;
    font-size: 16px;
    font-family: DejaVu Sans;
    font-weight: 400;
    line-height: 19.2px;
    word-wrap: break-word;
  }

  .todoChevron {
    width: 24px;
    align-self: stretch;
    text-align: center;
    color: #141518;
    font-size: 17px;
    font-family: SF Pro;
    font-weight: 590;
    line-height: 22px;
    word-wrap: break-word;
  }
</style>
