<script>
	import Button from "../components/Button.svelte";


	import Wordmark from "../components/Wordmark.svelte";

  function reload() {
      window.location.reload(true)
  }
</script>

<svelte:head>
    <title>Oops!</title>
</svelte:head>

<main>
    <h1>Oops!</h1>
    <p>Something got lost on our end. <br/>Retry again soon.</p>

    <img class="error-image" src='/choodle-choos.png' />

    <Button variant="big primary" on:click={reload}>Refresh</Button>

    <p>Having trouble? <a href="mailto:help@rmx.party">Email us</a></p>

    <footer>
        <Wordmark /> © 2023
    </footer>
</main>

<style>
:root {
  color: var(--choodle-black, #141518);
  font-size: var(--font-base-size);
  font-family: 'DejaVu Sans';
  text-align: center;
  font-style: normal;
  font-weight: 400;
  line-height: 120%; /* 1.35rem */
}
main {
    padding: 1rem;
}
h1 {
  font-size: 2rem;
  font-style: normal;
  font-weight: 700;
  line-height: 120%; /* 2.4rem */
  letter-spacing: 0.004rem;
}
p {
  font-size: 1.125rem;
}

img {
    width: 80vw;
    height: 10rem;
    margin-bottom: 6rem;
    object-fit: cover;
    overflow: visible;
}

pre {
  text-align: left;
  white-space: pre-wrap;
  margin: 2rem auto;
  display: block;
}

footer {
  padding: 1rem;
  margin: 0 auto;
  width: 100%;
  text-align: center;

  color: #000;
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 400;
  line-height: 120%; /* 1.05rem */
}
</style>
