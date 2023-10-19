<script lang="ts">
  import MetaData from "../../components/MetaData.svelte";
  import {page} from "$app/stores";
  import opengraphChoodle from '$lib/assets/OpenGraph-Choodle-1200x630-2x.jpg';
  import CertifiableChoodleBoard from "../../components/CertifiableChoodleBoard.svelte";
  import { choodleYellow, pageBackgroundDefault } from "$lib/Configuration";

  export let data;
</script>

<MetaData
  url={$page.url}
  title="Draw a Choodle"
  themeColor={choodleYellow}
  bgColor={pageBackgroundDefault}
  imageUrl={opengraphChoodle}
  imageAlt="Cursive writing of the word “Choodle” with doodle stars and a smiley face on a yellow background"
  width="1200"
  height="630"
  description="Draw something that lasts forever. Express yourself with lo-fi doodles that are yours to keep, sell, or share."/>

<div id="choodle-box">
  <CertifiableChoodleBoard id="choodle-board" prompt={data.prompt} certificateModal={data.certificateModal}></CertifiableChoodleBoard>
</div>

<style>
#choodle-box {
  touch-action: pan-x pan-y;
  touch-action: none;
}
</style>
