<script>
    import LoadingIndicator from "../../components/LoadingIndicator.svelte";

    import {loading} from "$lib/store";

    loading.set(true)

    setInterval(() => {
      loading.set(!$loading)
    }, 10000)
</script>

<LoadingIndicator />
