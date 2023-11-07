<script lang="ts">
  export let logoUrl
  export let logoLinkDestination = undefined

  import handDrawIcon from '$lib/assets/hand-draw.svg'
  import listIcon from '$lib/assets/list-icon.svg'
</script>

<header>
  <a href="/"><img class="side-icon" src={handDrawIcon} alt=""/></a>
  {#if logoLinkDestination}
    <a href={logoLinkDestination}>
      <img class="logo" src={logoUrl} alt=""/>
    </a>
  {:else}
    <img class="logo" src={logoUrl} alt=""/>
  {/if}
  <a href="/dashboard">
    <img class="side-icon" src={listIcon} alt=""/>
  </a>
</header>

<style>
  header {
    display: flex;
    justify-content: space-between;
    height: 44px;
    background: var(--choodle-yelllow, #FEF40A);
    align-content: center;
    align-items: center;
    flex-direction: row;
    flex-wrap: nowrap;
    padding: 0.5rem 1rem;
  }

  a {
    display: flex;
    align-items: center;
    align-content: center;
    justify-content: center;
  }

  .logo {
    width: 100px;
    height: 32px;
    flex-shrink: 0;
  }

  .side-icon {
    width: 26px;
    height: 26px;
    flex-shrink: 0;
  }
</style>
