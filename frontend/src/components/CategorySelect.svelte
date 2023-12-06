<script lang="ts">
  export let categories = []
  export let selectedCategory = undefined
</script>

<select bind:value={selectedCategory}>
  {#each categories as category, i (category._id)}
    <option value={category}>{category.label}</option>
  {/each}
</select>

<style>
  select,
  option {
    /* appearance: none; */
    color: #141518;
    font-size: 16px;
    font-family: DejaVu Sans;
    font-weight: 400;
    line-height: 19.2px;
    word-wrap: break-word;
    color: #141518;
    font-size: 17px;
    font-family: SF Pro;
    font-weight: 590;
    line-height: 22px;
    word-wrap: break-word;

    background: #fcfcfc;
  }

  select {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap;
    width: 100%;
    height: 100%;
    padding-left: 16px;
    padding-right: 16px;
    gap: 1px;
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
