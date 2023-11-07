<script lang="ts">
  import Button from '../../../components/Button.svelte';
  import MetaData from '../../../components/MetaData.svelte';
  import Wordmark from '../../../components/Wordmark.svelte';
  import handDraw from '$lib/assets/hand-draw.svg';
  import Dialog from '../../../components/Dialog.svelte';
  import {dialogState} from '$lib/store';

  function openTestDialog() {
    dialogState.update((dialogs) => {
      return {...dialogs, 'test-dialog': true};
    });
  }
</script>

<MetaData title="Choodle Components" themeColor="#FFFFFF"/>

<div class="container">
  <h1>Choodle Design Components</h1>

  <Button on:click={openTestDialog}>Open Dialog</Button>
  <Dialog id="test-dialog" initialOpen={false}>
    <h2 slot="header">
      modal <small><em>adjective</em> mod·al \ˈmō-dəl\</small>
    </h2>
    <ol class="definition-list">
      <li>of or relating to modality in logic</li>
      <li>
        containing provisions as to the mode of procedure or the manner of taking effect —used of a
        contract or legacy
      </li>
      <li>of or relating to a musical mode</li>
      <li>of or relating to structure as opposed to substance</li>
      <li>
        of, relating to, or constituting a grammatical form or category characteristically
        indicating predication
      </li>
      <li>of or relating to a statistical mode</li>
    </ol>
    <ol class="definition-list">
      <li>of or relating to modality in logic</li>
      <li>
        containing provisions as to the mode of procedure or the manner of taking effect —used of a
        contract or legacy
      </li>
      <li>of or relating to a musical mode</li>
      <li>of or relating to structure as opposed to substance</li>
      <li>
        of, relating to, or constituting a grammatical form or category characteristically
        indicating predication
      </li>
      <li>of or relating to a statistical mode</li>
    </ol>
    <ol class="definition-list">
      <li>of or relating to modality in logic</li>
      <li>
        containing provisions as to the mode of procedure or the manner of taking effect —used of a
        contract or legacy
      </li>
      <li>of or relating to a musical mode</li>
      <li>of or relating to structure as opposed to substance</li>
      <li>
        of, relating to, or constituting a grammatical form or category characteristically
        indicating predication
      </li>
      <li>of or relating to a statistical mode</li>
    </ol>
    <ol class="definition-list">
      <li>of or relating to modality in logic</li>
      <li>
        containing provisions as to the mode of procedure or the manner of taking effect —used of a
        contract or legacy
      </li>
      <li>of or relating to a musical mode</li>
      <li>of or relating to structure as opposed to substance</li>
      <li>
        of, relating to, or constituting a grammatical form or category characteristically
        indicating predication
      </li>
      <li>of or relating to a statistical mode</li>
    </ol>
    <ol class="definition-list">
      <li>of or relating to modality in logic</li>
      <li>
        containing provisions as to the mode of procedure or the manner of taking effect —used of a
        contract or legacy
      </li>
      <li>of or relating to a musical mode</li>
      <li>of or relating to structure as opposed to substance</li>
      <li>
        of, relating to, or constituting a grammatical form or category characteristically
        indicating predication
      </li>
      <li>of or relating to a statistical mode</li>
    </ol>

    <a href="https://www.merriam-webster.com/dictionary/modal"> merriam-webster.com </a>
  </Dialog>

  <h2>typography</h2>
  <h1>h1</h1>
  <h2>h2</h2>
  <h3>h3</h3>
  <strong>Body-Bold</strong>
  <p>Body-Reg</p>
  <a>Link</a>

  <figure>
    <img src="/choodle-bob-p2.png" width="100"/>
    <figcaption>
      <strong>Caption-Bold</strong>
      Caption-Reg
    </figcaption>
  </figure>

  <h2>wordmark</h2>
  <Wordmark/>

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
  <Button variant="secondary disabled" icon={handDraw} iconPosition="right">disabled</Button>
  <Button icon={handDraw} variant="secondary yellow">yellow</Button>
  <Button variant="yellow" iconPosition="right">yellow</Button>
  <Button variant="secondary hover yellow" icon={handDraw} iconPosition="right">hover</Button>
</div>

<style>
  .container {
    background: white;
    padding: 1rem;
  }
</style>
