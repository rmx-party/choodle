<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
</head>
<div>
<slot></slot>
</div>

<script lang="ts">
import { dev } from "$app/environment"
import { inject } from "@vercel/analytics"

inject({ mode: (dev ? 'development' : 'production')});
</script>
