<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { PaletteType } from "../../../stores/paletteStore";
  import {
    active_palette_store,
    DeleteColorPalette,
    editting_tile_store,
    initialPalette,
    PushColorIntoActivePalette,
    RemoveFromColorsArray,
    SaveColorPalette,
    UpdatePaletteName,
  } from "../../../stores/paletteStore";
  import Close from "../../graphics/Close.svelte";
  import SaveIcon from "../../graphics/SaveIcon.svelte";
  import Folder from "../../graphics/Folder.svelte";
  import TrashCanBig from "../../graphics/TrashCanBig.svelte";
  import { event_state_store } from "../../../stores/eventState";
  import { get } from "svelte/store";
  import { color_store } from "../../../stores/colorStore";

  let activePalette: PaletteType;
  let nameInput: string;
  let edittingItem: number | null;
  let oldEventState = get(event_state_store);

  const unsubcribe = active_palette_store.subscribe((value: PaletteType) => {
    activePalette = value;
    if (value.name) {
      nameInput = value.name;
    }
  });

  const unsubcribe2 = editting_tile_store.subscribe((value: number | null) => {
    edittingItem = value;
  });

  function handleClose() {
    const from = oldEventState.split("&")[1];
    event_state_store.set(from);
  }

  function clearBorders() {
    for (let i = 0; i <= 16; i++) {
      const element = document.getElementById(`color-button-palette-form&${i}`);
      if (!element) return;
      element.style.border = "none";
      element.style.outline = "none";
    }
  }

  function unfocusButton(e: PointerEvent) {
    const target = e.target as HTMLElement;
    if (target.id === "remove-button") return;
    if (target.classList.contains("IroBox")) return;
    if (target.classList.contains("IroSliderGradient")) return;
    if (target.classList.contains("IroSliderGradient")) return;
    if (target.closest("#picker2")) {
      return;
    }
    if (!target.id || !target.id.includes("color-button-palette-form")) {
      clearBorders();
      editting_tile_store.set(null);
    }
  }

  function handleClick(index: number) {
    editting_tile_store.set(index);
    color_store.set(activePalette.colors[index]);
  }

  function handleDelete() {
    if (activePalette.id) {
      DeleteColorPalette();
    } else {
      if (window.confirm("Are you sure you want to clear this palette?")) {
        active_palette_store.set(initialPalette);
      }
    }
  }

  function handleRemove(e: Event) {
    if (edittingItem !== null) {
      RemoveFromColorsArray(edittingItem);
    }
    editting_tile_store.set(null);
  }

  function handleContinueDrawing(e: any) {
    if (e.target.id === "main-canvas") {
      const from = oldEventState.split("&")[1];
      event_state_store.set(from);
    }
  }

  function handleAdd() {
    if (activePalette.colors.length < 16) {
      PushColorIntoActivePalette("rgb(255, 255, 255)");
      editting_tile_store.set(activePalette.colors.length - 1);
    }
  }

  $: {
    //border around selected box
    //event listener to click out
    if (edittingItem !== null) {
      document.addEventListener("pointerdown", unfocusButton);
      setTimeout(() => {
        const element = document.getElementById(
          `color-button-palette-form&${String(edittingItem)}`,
        );
        if (element) {
          clearBorders();
          element.style.border = "2px solid lightgray";
          element.style.outline = "2px solid white";
        }
      }, 1);
    } else {
      document.removeEventListener("pointerdown", unfocusButton);
      clearBorders();
    }
  }

  onMount(() => {
    document.addEventListener("pointerdown", handleContinueDrawing);
  });

  onDestroy(() => {
    unsubcribe();
    unsubcribe2();
    document.removeEventListener("pointerdown", handleContinueDrawing);
  });
</script>

<form class="color-palette-form cool" on:submit|preventDefault={SaveColorPalette}>
  <div class="top-row">
    <div id="empty" />
    <div class="center-top">
      <h3 style="text-align: center; margin-top: 0px">Palette</h3>
    </div>
    <div class="top-right">
      <button
        type="button"
        class="clear-button moved close-button centered"
        on:click={handleClose}
      >
        <Close />
      </button>
    </div>
  </div>
  <div class="input-row centered">
    <input
      type="text"
      placeholder="Palette name"
      value={activePalette.name}
      on:input={UpdatePaletteName}
      required
    />
  </div>
  <div class="middle-container centered">
    <div class="options-menu">
      <button type="submit" class="clear-button small">
        <SaveIcon />
      </button>
      <button type="button" class="clear-button small">
        <Folder />
      </button>
      <button type="button" class="clear-button small" on:click={handleDelete}>
        <TrashCanBig />
      </button>
    </div>
    <div class="palette-grid">
      {#each activePalette.colors as color, index}
        <button
          class="big-color"
          id={`color-button-palette-form&${String(index)}`}
          on:pointerdown={() => {
            handleClick(index);
          }}
          type="button"
          style="background-color: {color};"
        />
      {/each}
    </div>
    <div class="options-menu right">
      <button
        type="button"
        id="remove-button"
        class="clear-button remove"
        on:click={handleAdd}
        >add
      </button>
      <button
        type="button"
        id="remove-button"
        class="clear-button remove"
        on:click={handleRemove}
        >remove
      </button>
    </div>
  </div>
</form>

<style>
  input {
    margin-top: 0px;
    width: 300px;
  }

  button,
  button:active,
  button:focus,
  button:hover,
  button:focus-visible {
    outline: none;
    border: none;
    box-shadow: none;
  }
  .color-palette-form {
    position: fixed;
    top: 50%;
    transform: translate(-50%, -50%);
    left: 50%;
    z-index: 1000;
    background-color: rgb(25, 29, 31);
    padding-left: 0px;
    padding-right: 0px;
    padding-bottom: 40px;
  }

  .input-row {
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
  }

  .middle-container {
    display: grid;
    grid-template-columns: 0.5fr 1fr 0.5fr;
    width: 100%;
    margin-top: 20px;
  }

  .options-menu {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: flex-start;
    gap: 10px;
    align-items: center;
    justify-content: center;
  }

  /* .right {
    justify-content: center;
  } */

  .remove {
    width: auto;
    height: 80px;
    width: 94px;
    border: 1px solid white;
  }

  .remove:hover,
  .remove:focus {
    border: 1px solid white;
  }

  .small {
    width: 70px;
    height: 70px;
    padding: 0px;
  }

  .palette-grid {
    display: grid;
    gap: 10px;
    height: 310px;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(4, 1fr);
    border: 1px solid lightgray;
    border-radius: 10px;
    padding: 10px;
    width: 322px;
  }

  .moved {
    transform: translate(-10px, -10px);
    width: 50px;
  }

  .top-right {
    display: flex;
    justify-content: flex-end;
  }

  .top-row {
    display: grid;
    width: 100%;
    grid-template-columns: 1fr 1fr 1fr;
  }

  .center-top {
    text-align: center;
  }

  .big-color {
    height: 70px;
    width: 70px;
    border-radius: 8px;
    cursor: pointer;
    transition: none;
  }

  .right {
    justify-content: center;
  }
</style>
