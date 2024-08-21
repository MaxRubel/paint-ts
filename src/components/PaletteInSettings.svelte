<script lang="ts">
  import { onDestroy } from "svelte";
  import {
    active_color_store,
    active_palette_store,
    ClearPalette,
    editting_tile_store,
  } from "../../stores/paletteStore";
  import { event_state_store } from "../../stores/eventState";
  import { authStore } from "../../utils/auth/auth_store";

  let activePalette: any = {
    colors: [],
  };
  let eventState: string;
  let auth: any;
  let edittingTile: number | null;
  let activeColor: string;
  let activeColorIndex: number;

  const unsubscribe = active_palette_store.subscribe((value) => {
    activePalette = value;
  });

  const unsubcribe2 = event_state_store.subscribe((value) => {
    eventState = value;
  });

  const unsubscribe3 = authStore.subscribe((value) => {
    auth = value.user;
  });

  const unsubscribe4 = editting_tile_store.subscribe((value) => {
    edittingTile = value;
  });

  const unsubscribe5 = active_color_store.subscribe((value) => {
    activeColor = value;
  });

  onDestroy(() => {
    unsubscribe();
    unsubcribe2();
    unsubscribe3();
    unsubscribe4();
    unsubscribe5();
  });

  let dropArrow = false;
  let smallPaletteMenu = false;

  function toggleOnDrop() {
    dropArrow = true;
  }

  function toggleOffDrop() {
    dropArrow = false;
  }

  function handleOpenSmallPaletteMenu() {
    if (eventState === "color_palette_edit&drawing") {
      event_state_store.set("drawing");
      return;
    }
    if (smallPaletteMenu) {
      smallPaletteMenu = false;
    } else {
      smallPaletteMenu = true;
    }
  }

  $: console.log(activeColorIndex);

  function openPaletteWindow() {
    event_state_store.set("color_palette_edit_form&drawing");
  }

  function handleNewPalette() {
    ClearPalette();
  }

  function clearSmallBorders() {
    for (let i = 0; i < activePalette.colors.length; i++) {
      const element = document.getElementById(`small-color-button&${i}`);
      if (element) {
        element.style.border = "1px solid transparent";
        element.style.outline = "none";
      }
    }
  }

  function addBorder(element: HTMLElement) {
    element.style.border = "1px solid lightgrey";
    element.style.outline = "2px solid white";
    console.log("adding border to: ", element.id);
    console.log("new style is: ", element.style.border);
    console.log(element.style.cssText);
  }

  function handleClickSmall(color: string, index: number) {
    if (!eventState.includes("color_palette_edit")) {
      active_color_store.set(color);
    } else {
      editting_tile_store.set(index);
    }
    clearSmallBorders();
    const element = document.getElementById(`small-color-button&${index}`);
    if (element) {
      addBorder(element);
    }
  }

  $: {
    //mark the correct border upon changing the parent menu
    if (!eventState.includes("color_palette_edit")) {
      const index = activePalette.colors.findIndex(
        (item: any) => item === activeColor,
      );
      const element = document.getElementById(`small-color-button&${index}`);
      if (element) {
        addBorder(element);
      }
    } else {
      //if editting a tile in the edit palette menu, mark the correct border
      if (edittingTile !== null) {
        const element = document.getElementById(
          `small-color-button&${edittingTile}`,
        );
        if (element) {
          addBorder(element);
        }
      } else {
        clearSmallBorders();
      }
    }
  }
</script>

<div class="palette">
  <button
    id="small-palette-menu-opener"
    class="clear-button"
    on:mouseenter={toggleOnDrop}
    on:mouseleave={toggleOffDrop}
    on:click={handleOpenSmallPaletteMenu}
  >
    Palette
  </button>
  <div class="recent-choices">
    {#each activePalette.colors as color, index}
      <div class="color-box">
        <button
          class="color-button"
          id={`small-color-button&${index}`}
          on:mousedown={() => {
            handleClickSmall(color, index);
          }}
          style="background-color: {color}"
        ></button>
      </div>
    {/each}
  </div>
  <div class="smol-row">
    {#if auth?.id && activePalette.colors.length > 0}
      <button class="clear-button centered smol" on:click={handleNewPalette}>
        New
      </button>
      <button class="clear-button centered smol" on:click={openPaletteWindow}>
        Edit
      </button>
    {/if}
  </div>
</div>

<style>
  .palette {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
    height: 240px;
  }

  .recent-choices {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: min-content;
    margin-top: 10px;
    border-radius: 10pt;
    flex-grow: 1;
    width: 180px;
    gap: 5px;
    align-content: start;
  }

  .color-button {
    width: 30px;
    height: 30px;
    transition: none;
  }

  .smol {
    width: 122px;
  }

  .smol-row {
    display: flex;
    gap: 0px;
    margin-top: 10px;
  }
</style>
