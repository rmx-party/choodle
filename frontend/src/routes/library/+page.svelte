<script lang="ts">
    import Button from "../../components/Button.svelte";
    import MetaData from "../../components/MetaData.svelte";
    import Wordmark from "../../components/Wordmark.svelte"
    import handDraw from "$lib/assets/hand-draw.svg"
</script>

<style>
    .container {
        background: white;
        padding: 1rem;
    }
</style>

<MetaData 
    title="Choodle Components"
    themeColor="#FFFFFF"
/>


<div class="container">

<h1>Choodle Design Components</h1>

<h2>typography</h2>
<h1>h1</h1>
<h2>h2</h2>
<h3>h3</h3>
<strong>Body-Bold</strong>
<p>Body-Reg</p>
<a>Link</a>

<figure>
    <img src='/choodle-bob-p2.png' width="100" />
    <figcaption>
        <strong>Caption-Bold</strong>
        Caption-Reg
    </figcaption>
</figure>

<h2>wordmark</h2>
<Wordmark />

<h2>Buttons</h2>
<Button variant="primary" icon={handDraw}>primary</Button>
<Button variant="primary yellow" icon={handDraw}>yellow</Button>
<Button variant="primary hover" icon={handDraw}>hover</Button>
<Button variant="primary press" icon={handDraw}>press</Button>
<Button variant="primary press yellow" icon={handDraw}>press yellow</Button>
<Button variant="primary focus" icon={handDraw}>focus</Button>
<Button variant="primary disabled" icon={handDraw}>disabled</Button>

<Button>button</Button>
<Button icon={handDraw}>button + icon</Button>
<Button icon={handDraw} iconPosition="right">right icon</Button>
<Button variant="secondary hover" icon={handDraw} iconPosition="right">hover</Button>
<Button variant="secondary press" icon={handDraw} iconPosition="right">press</Button>
<Button variant="secondary focus" icon={handDraw} iconPosition="right">focus</Button>
<Button variant="secondary disabled" icon={handDraw}
    iconPosition="right">disabled</Button>
<Button icon={handDraw} variant="secondary yellow">yellow</Button>
<Button variant="yellow" iconPosition="right">yellow</Button>
<Button variant="secondary hover yellow" icon={handDraw}
    iconPosition="right">hover</Button>

</div>
