<script lang="ts">
  import Button from "../../../../../components/Button.svelte";
  import {goto} from "$app/navigation";
  import {toHTML} from "@portabletext/to-html";
  import {urlFor} from "$lib/PersistedImagesUtils";
  import MetaData from "../../../../../components/MetaData.svelte";
  import { choodleYellow, pageBackgroundDefault } from "$lib/Configuration";
  import { page } from "$app/stores";
  import LayoutContainer from "../../../../../components/LayoutContainer.svelte";

  export let data;
</script>


<MetaData
  title="Choodle with Friends"
  themeColor={choodleYellow}
  bgColor={pageBackgroundDefault}
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

  <h3><strong>{data.choodle?.gamePrompt?.toUpperCase() || ''}</strong></h3>

  <div>
    <Button on:click={() => { goto('/game/cwf/pick')}}
      colour="yellow">{data.copy.success_continueGameButtonText}</Button>
  </div>
</LayoutContainer>
