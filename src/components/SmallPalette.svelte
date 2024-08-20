<script>
  import { onMount } from "svelte";

  export let palette;

  let mouseIsOver = false;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="small-palette"
  on:mouseenter={() => {
    mouseIsOver = true;
  }}
  on:mouseleave={() => {
    mouseIsOver = false;
  }}
  class:mouseIsOver
>
  <div class="small-header">{palette.name}</div>
  <div class="small-color-container">
    {#each palette.colors as color}
      <div class="small-color" style="background-color: {color};" />
    {/each}
  </div>
</div>

<style>
  .small-palette {
    padding: 10px;
    border: 1px solid white;
    border-radius: 10px;
  }

  .small-header {
    text-align: center;
    width: 100%;
  }

  .small-color-container {
    width: calc(100%);
    height: calc(100% - 20px);
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 5px;
  }

  .small-color {
    border-radius: 2px;
  }

  .mouseIsOver {
    background-color: rgb(45, 51, 58);
    cursor: pointer;
  }
</style>
