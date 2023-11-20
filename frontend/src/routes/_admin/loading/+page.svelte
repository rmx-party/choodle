<script>
  import { loading, loadingOverride } from '$lib/store'
  import { onMount } from 'svelte'

  loading.set(true)

  onMount(() => {
    loadingOverride.set(true)

    return () => {
      loadingOverride.set(false)
    }
  })
</script>
