<script lang="ts">
  import { dashboardPath, pickPath } from '$lib/routes'

  export let logoUrl: string | undefined
  export let logoLinkDestination: string | undefined = undefined

  import newGameIcon from '$lib/assets/m.nav-icon-pick.svg'
  import listIcon from '$lib/assets/m.nav-icon-dash.svg'
</script>

<header class="no-pan">
  <a id="top-new-game-link" href={pickPath()}><img class="side-icon" src={newGameIcon} alt="" /></a>
  {#if logoLinkDestination}
    <a id="top-logo-link" href={logoLinkDestination}>
      <img class="logo" src={logoUrl} alt="" />
    </a>
  {:else}
    <img class="logo" src={logoUrl} alt="" />
  {/if}
  <a id="top-dashboard-link" href={dashboardPath()}>
    <img class="side-icon" src={listIcon} alt="" />
  </a>
</header>

<style>
  header {
    display: flex;
    justify-content: space-between;
    height: 2.75rem;
    background: var(--choodle-yellow);
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
    height: 2rem;
    flex-shrink: 0;
  }

  .side-icon {
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
  }

  .no-pan {
    touch-action: pan-x pan-y;
    touch-action: none;
  }
</style>
