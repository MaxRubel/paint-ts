<script lang="ts">
  import { get } from "svelte/store";
  import { event_state_store } from "../../../stores/eventState";
  import type { PaletteType } from "../../../stores/paletteStore";
  import {
    active_color_store,
    active_palette_store,
    border_index_store,
    SetPaletteById,
  } from "../../../stores/paletteStore";
  import TinyPaletteMenu from "./TinyPaletteMenu.svelte";

  export let palette: PaletteType;

  let mouseIsOver = false;

  function handleClick(e: any) {
    //set the active color of the first of the new palette if changing palette
    if (palette.id !== get(active_palette_store).id) {
      active_color_store.set(palette.colors[0]);
    }
    SetPaletteById(palette.id);
    if (!e.target.id.includes("delete-palette-button-small")) {
      event_state_store.set("drawing");
      border_index_store.set(0);
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="small-palette"
  on:mouseenter={() => {
    mouseIsOver = true;
  }}
  on:mouseleave={() => {
    mouseIsOver = false;
  }}
  on:click={handleClick}
  class:mouseIsOver
>
  <div class="small-header">{palette.name}</div>
  <div class="small-color-container">
    {#each palette.colors as color}
      <div class="small-color" style="background-color: {color};" />
    {/each}
  </div>
  {#if mouseIsOver}
    <TinyPaletteMenu paletteId={palette.id} />
  {/if}
</div>

<style>
  .small-palette {
    padding: 10px;
    border: 1px solid white;
    border-radius: 10px;
    position: relative;
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
