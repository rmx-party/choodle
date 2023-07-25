<script lang="ts">
    import Button from "../../components/Button.svelte";
    import Drawer from "../../components/Drawer.svelte"
    import MetaData from "../../components/MetaData.svelte";
    import Wordmark from "../../components/Wordmark.svelte"
</script>

<MetaData 
    title="Choodle Components"
    themeColor="#FEF40A"
/>

<h1>Choodle Design Components</h1>

<h2>wordmark</h2>
<Wordmark />

<h2>Buttons</h2>
<Button>button</Button>
<Button variant="primary">primary button</Button>

<hr/>


<Drawer/>
