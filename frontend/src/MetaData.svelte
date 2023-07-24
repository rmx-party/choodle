<script lang="ts">
    export let url;
    export let title;
    export let imageUrl;
    export let imageAlt;
    export let width;
    export let height;
    export let description;
</script>

<svelte:head>
    <!-- TODO: set canonical URL (decide trailing slash etc) -->
    <meta property="og:type" content='website'/>
    {#if url}
        <meta property="og:url" content={url}/>
    {/if}
    <meta property="og:site_name" content="Choodle"/>
    {#if title}
        <title>{title}</title>
        <meta property="og:title" content={title}/>
    {/if}
    {#if imageUrl}
        <meta property="og:image" content={imageUrl}/>
        <meta property="og:image:secure_url" content={imageUrl}/>
        <meta property="og:image:width" content={width}/>
        <meta property="og:image:height" content={height}/>
        <meta property="og:image:alt" content={imageAlt}/>
    {/if}
    {#if description}
        <meta property="og:description" content={description}/>
        <meta name="description" content={description}/>
    {/if}
</svelte:head>
