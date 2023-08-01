<script>
    import LoadingIndicator from "../../components/LoadingIndicator.svelte";

    import {loading} from "$lib/store";

    loading.set(true)
</script>

<LoadingIndicator explanation="enhancing happiness"/>
