<script lang="ts">
  export let logoUrl
  export let logoLinkDestination = undefined

  import handDrawIcon from '$lib/assets/hand-draw.svg'
  import listIcon from '$lib/assets/list-icon.svg'
</script>

<header>
  <a href="/"><img src={handDrawIcon} alt=""/></a>
  {#if logoLinkDestination}
    <a href={logoLinkDestination}>
      <img src={logoUrl} alt=""/>
    </a>
  {:else}
    <img src={logoUrl} alt=""/>
  {/if}
  <a href="/dashboard">
    <img src={listIcon} alt=""/>
  </a>
</header>
