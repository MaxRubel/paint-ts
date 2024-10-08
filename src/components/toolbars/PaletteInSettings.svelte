<script lang="ts">
  import { onDestroy } from "svelte";
  import {
    active_color_store,
    active_palette_store,
    border_index_store,
    ClearPalette,
    editting_tile_store,
  } from "../../../stores/paletteStore";
  import { event_state_store, selected_store } from "../../../stores/eventState";
  import { authStore } from "../../../utils/auth/auth_store";
  import { get } from "svelte/store";
  import { textBoxesStore, updateTextBox } from "../../../stores/textBoxStore";
  import { AddUndoItem, undo_store } from "../../../stores/undoStore";
  import SmallViewPalettes from "../menus/SmallViewPalettes.svelte";

  let activePalette: any = {
    colors: [],
  };
  let eventState: string;
  let auth: any;
  let activeColor: string;
  let edittingTile: number | null;
  let borderIndex: number | null;
  let selected: number | null;

  let dropArrow = false;
  let smallPaletteMenu = false;

  $: activePalette = $active_palette_store;
  $: eventState = $event_state_store;
  $: auth = $authStore.user;
  $: edittingTile = $editting_tile_store;
  $: activeColor = $active_color_store;
  $: borderIndex = $border_index_store;

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
  function closeSmallMenu() {
    smallPaletteMenu = false;
  }

  function openPaletteWindow() {
    event_state_store.set(`color_palette_edit_form&${eventState}`);
    editting_tile_store.set(borderIndex);
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
  }

  function handleClickSmall(newColor: string, index: number) {
    border_index_store.set(index);
    if (!eventState.includes("color_palette_edit")) {
      active_color_store.set(newColor);
    } else {
      editting_tile_store.set(index);
    }

    clearSmallBorders();

    const element = document.getElementById(`small-color-button&${index}`);
    if (element) {
      addBorder(element);
    }

    if (eventState === "selected") {
      const selectedArray = get(selected_store);
      const undoArray: any[] = [];

      selectedArray.forEach((item) => {
        const [, id] = item.id.split("&");
        if (item.id.includes("textbox")) {
          const ogTextbox = get(textBoxesStore)[id];
          if (!ogTextbox) return;
          if (!ogTextbox.fontColor) return;
          const oldColor = ogTextbox.fontColor;
          if (oldColor !== newColor) {
            undoArray.push({
              id,
              fontColor: ogTextbox.fontColor,
            });
            updateTextBox(id, { fontColor: newColor });
          }
        }
      });
      if (undoArray.length > 0) {
        AddUndoItem({
          action: "changedManyFontColors",
          data: undoArray,
        });
      }
    }

    if (eventState.includes("typing")) {
      const textBoxId = eventState.split("&")[1];
      const ogTextbox = get(textBoxesStore)[textBoxId];
      const oldColor = ogTextbox.fontColor;
      const undos = get(undo_store);
      if (oldColor !== newColor) {
        updateTextBox(textBoxId, { fontColor: newColor });
        AddUndoItem({
          action: "changedFontColor",
          data: {
            id: textBoxId,
            oldColor,
          },
        });
      }
      event_state_store.set(`typing&${textBoxId}`);
      const element = document.getElementById(`textbox&${textBoxId}`);
      if (!element) return;
      element.focus();
    }
  }

  $: if (edittingTile !== null) {
    selected = edittingTile;
  } else {
    selected = borderIndex;
  }
</script>

{#if smallPaletteMenu}
  <SmallViewPalettes {closeSmallMenu} />
{/if}
<div class="palette">
  {#if auth?.id}
    <button
      id="small-palette-menu-opener"
      class="clear-button"
      on:mouseenter={toggleOnDrop}
      on:mouseleave={toggleOffDrop}
      on:click={handleOpenSmallPaletteMenu}
    >
      Palette
    </button>
  {:else}
    Palette
  {/if}
  <div class="recent-choices">
    {#each activePalette.colors as color, index}
      <div class="color-box">
        <button
          class="color-button"
          id={`small-color-button&${index}`}
          on:mousedown={() => {
            handleClickSmall(color, index);
          }}
          style="background-color: {color}; outline: {selected === index
            ? '2px solid white'
            : 'none'};
            border: {selected === index ? '1px solid lightgrey' : 'none'}
            "
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
