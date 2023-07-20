<script lang="ts">
    export let url;
    export let title;
    export let imageUrl;
    export let width;
    export let height;
    export let description;
</script>

<svelte:head>
    <!-- TODO: set canonical URL (decide trailing slash etc) -->
    <meta property="og:type" content='website'/>
    <meta property="og:url" content={url}/>
    <meta property="og:site_name" content="Choodle"/>
    <title>{title}</title>
    <meta property="og:title" content={title}/>
    <meta property="og:image" content={imageUrl}/>
    <meta property="og:image:secure_url" content={imageUrl}/>
    <meta property="og:image:width" content={width}/>
    <meta property="og:image:height" content={height}/>
    <meta property="og:image:alt" content={title}/>
    <meta property="og:description" content={title}/>
    <meta name="description" content={description}/>
</svelte:head>
