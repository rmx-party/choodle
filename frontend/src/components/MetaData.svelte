<script lang="ts">
  import { browser } from "$app/environment";
  import { backgroundColour } from "$lib/Configuration";
  import { setDynamicBackground } from "$lib/DynamicBackground";

  export let url: URL | string | undefined = undefined;
  export let title: string | undefined = undefined;
  export let imageUrl: string | undefined = undefined;
  export let imageAlt: string | undefined = undefined;
  export let width: number | string | undefined = undefined;
  export let height: number | string | undefined = undefined;
  export let description: string | undefined = undefined;
  export let themeColor: string | null = backgroundColour;

  if (browser && themeColor) {
    console.log('setting theme color', themeColor)
    document?.querySelector('meta[name=theme-color]')?.setAttribute('content', `${themeColor}`)
    setDynamicBackground(themeColor);
  }
</script>

<svelte:head>
  <!-- TODO: set canonical URL (decide trailing slash etc) -->
  <meta property="og:type" content='website'/>
  {#if url}
    <meta property="og:url" content={`${url}`}/>
  {/if}
  <meta property="og:site_name" content="Choodle"/>
  {#if title}
    <title>{title}</title>
    <meta property="og:title" content={title}/>
  {/if}
  {#if imageUrl}
    <meta property="og:image" content={imageUrl}/>
    <meta property="og:image:secure_url" content={imageUrl}/>
    <meta property="og:image:width" content={`${width}`}/>
    <meta property="og:image:height" content={`${height}`}/>
    {#if imageAlt}
      <meta property="og:image:alt" content={imageAlt}/>
    {/if}
  {/if}
  {#if description}
    <meta property="og:description" content={description}/>
    <meta name="description" content={description}/>
  {/if}
  {#if themeColor}
    <meta name="theme-color" content={themeColor}/>
  {/if}
</svelte:head>
