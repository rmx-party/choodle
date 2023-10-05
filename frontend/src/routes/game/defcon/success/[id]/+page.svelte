<script lang="ts">
  import Button from "../../../../../components/Button.svelte";
  import {goto} from "$app/navigation";
  import {toHTML} from "@portabletext/to-html";
  import {urlFor} from "$lib/PersistedImagesUtils";
  import LayoutContainer from "../../../../../components/LayoutContainer.svelte";
  import MetaData from "../../../../../components/MetaData.svelte";
  import { page } from "$app/stores";
  import {pageBackgroundDefault} from '$lib/Configuration';

  export let data;
</script>

<MetaData
  title="Choodle w/ Friends: DEFcon Edition"
  themeColor={pageBackgroundDefault}
  url={$page.url}
/>

<LayoutContainer --layout-justify='space-evenly'>
  <div class="content">
    {@html toHTML(data.copy.success_topContent)}
  </div>

  <div class="choodle-container">
    <img class="choodle" src={urlFor(data.choodle.upScaledImage).url()}
         width='390' height='520' alt=''/>
  </div>

  <h3><strong>{data.choodle.gamePrompt.toUpperCase()}</strong></h3>

  <div>
    <Button on:click={() => { goto('/game/defcon/pick')}}
            colour="yellow">{data.copy.success_continueGameButtonText}</Button>
  </div>
</LayoutContainer>

