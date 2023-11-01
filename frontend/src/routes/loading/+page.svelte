<script>
  import { loading } from '$lib/store';

  loading.set(true);

  setInterval(() => {
    loading.set(!$loading);
  }, 8000);
</script>
