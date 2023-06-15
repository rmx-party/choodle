<svelte:head>
    <title>Choodle Prototype</title>
</svelte:head>

<div>
<slot></slot>
</div>

<script lang="ts">
import { dev } from "$app/environment"
import { inject } from "@vercel/analytics"

inject({ mode: (dev ? 'development' : 'production')});
</script>
