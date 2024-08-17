<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { event_state_store, selected_store } from "../../stores/eventState";
  import Slider from "./Slider.svelte";
  import iro from "@jaames/iro";
  import { color_store } from "../../stores/colorStore";
  import { get } from "svelte/store";
  import { authStore } from "../../utils/auth/auth_store";
  import {
    active_palette_store,
    ClearPalette,
    editting_tile_store,
    PushColorIntoActivePalette,
    UpdateColorTile,
  } from "../../stores/paletteStore";
  import type { PaletteType } from "../../stores/paletteStore";
  import { updateTextBox, textBoxesStore } from "../../stores/textBoxStore";
  import { AddUndoItem } from "../../stores/undoStore";
  import type { TextBoxType } from "../../utils/types/app_types";
  import DownArrow from "../graphics/DownArrow.svelte";
  import SmallViewPalettes from "./menus/SmallViewPalettes.svelte";

  let eventState: string = "";
  let colorPicker: any;
  let isVisible: boolean = false;
  let auth: any;
  let activePalette: PaletteType;
  let draggingColor: Boolean;
  let edittingTile: number | null;
  let activeColor: string;

  const unsubcribe = event_state_store.subscribe((value) => {
    eventState = value;
  });

  const unsubcribe2 = authStore.subscribe((value) => {
    auth = value.user;
  });

  const unsubscribe3 = active_palette_store.subscribe((value: PaletteType) => {
    activePalette = value;
  });

  const unsubscribe4 = editting_tile_store.subscribe((value) => {
    edittingTile = value;
  });

  const unsubscribe5 = color_store.subscribe((value) => {
    activeColor = value;
  });

  function handleChangeColor(origin: string) {
    let newColorF;
    if (origin === "box") {
      const newColor = colorPicker.color.rgb;
      newColorF = `rgb(${newColor.r}, ${newColor.g}, ${newColor.b})`;
    } else {
      newColorF = origin;
    }
    if (edittingTile !== null) {
      if (edittingTile >= 16) {
        UpdateColorTile(newColorF, 15);
        return;
      }
      UpdateColorTile(newColorF, edittingTile);
      return;
    } else {
      editting_tile_store.set(activePalette.colors.length);
    }
    color_store.set(newColorF);
    const eventState = get(event_state_store);

    if (eventState === "selected") {
      const selectedArray = get(selected_store);
      const undoArray: any[] = [];
      selectedArray.forEach((item: TextBoxType) => {
        const [, id] = item.id.split("&");
        if (item.id.includes("textbox")) {
          const ogTextbox = get(textBoxesStore)[id];
          if (ogTextbox.fontColor !== newColorF) {
            undoArray.push({ id, fontColor: ogTextbox.fontColor });
            updateTextBox(id, { fontColor: newColorF });
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
    if (draggingColor) return;
    if (activePalette.colors.includes(newColorF)) return;
    if (activePalette.id) return;
    PushColorIntoActivePalette(newColorF);
  }

  function handleClickSmall(color: string, index: number) {
    clearSmallBorders();
    if (!eventState.includes("color_palette_form")) {
      color_store.set(color);
    } else {
      editting_tile_store.set(index);
    }
  }

  function openPaletteWindow() {
    event_state_store.set("color_palette_form&drawing");
  }

  let dropArrow = false;
  let smallPaletteMenu = false;
  function toggleOnDrop() {
    dropArrow = true;
  }
  function toggleOffDrop() {
    dropArrow = false;
  }

  function handleOpenSmallPaletteMenu() {
    if (smallPaletteMenu) {
      smallPaletteMenu = false;
    } else {
      smallPaletteMenu = true;
    }
  }

  function closeSmallMenu() {
    smallPaletteMenu = false;
  }

  function handleNewPalette() {
    ClearPalette();
  }

  function clearSmallBorders() {
    for (let i = 0; i < activePalette.colors.length; i++) {
      const element = document.getElementById(`brush-settings-color-button&${i}`);
      if (element) {
        element.style.border = "none";
        element.style.outline = "none";
      }
    }
  }
  function addBorder(element: HTMLElement) {
    clearSmallBorders();
    element.style.border = "2px solid lightgrey";
    element.style.outline = "2px solid white";
  }
  $: {
    if (eventState === "drawing") {
      const index = activePalette.colors.findIndex((item) => item === activeColor);
      const element = document.getElementById(
        `brush-settings-color-button&${index}`,
      );
      if (element) {
        addBorder(element);
      }
    } else if (eventState.includes("color_palette_form")) {
      if (edittingTile !== null) {
        const element = document.getElementById(
          `brush-settings-color-button&${edittingTile}`,
        );
        if (element) {
          addBorder(element);
        }
      } else {
        clearSmallBorders();
      }
    }
  }

  $: onDestroy(() => {
    unsubcribe();
    unsubcribe2();
    unsubscribe3();
    unsubscribe4();
    unsubscribe5();
  });

  onMount(() => {
    // @ts-ignore
    colorPicker = new iro.ColorPicker("#picker2", {
      width: 200,
      layout: [
        {
          component: iro.ui.Box,
        },
        {
          component: iro.ui.Slider,
          options: {
            sliderType: "hue",
            width: 200,
            height: 20,
          },
        },
      ],
    });
  });

  $: {
    if (eventState.includes("drawing")) {
      isVisible = true;
    } else {
      isVisible = false;
    }
  }

  let creatingNew = false;
  let mouseHasLeftWhileDragging = false;
</script>

<div class="color-bar-3" class:isVisible>
  {#if smallPaletteMenu}
    <SmallViewPalettes {closeSmallMenu} />
  {/if}
  <div class="content-wrapper">
    <div class="slider centered" style="flex-direction: column">
      Stroke
      <div class="centered" style="margin-top: 5px;"><Slider /></div>
    </div>
    <div
      style="margin-top: 10px; flex-direction: column"
      class="centered color-container"
    >
      Color
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="color-picker"
        id="picker2"
        on:pointerdown={() => {
          draggingColor = true;
          if (edittingTile === null) {
            creatingNew = true;
            editting_tile_store.set(activePalette.colors.length);
          }
          handleChangeColor("box");
        }}
        on:mousemove={() => {
          if (draggingColor) {
            handleChangeColor("box");
          }
        }}
        on:mouseleave={() => {
          if (creatingNew) {
            mouseHasLeftWhileDragging = true;
          }
        }}
        on:mouseenter={() => {
          if (creatingNew && mouseHasLeftWhileDragging) {
            mouseHasLeftWhileDragging = false;
          }
        }}
        on:pointerup={() => {
          handleChangeColor("box");
          draggingColor = false;
          //@ts-ignore
          color_store.set(activePalette.colors[edittingTile]);
          if (creatingNew || mouseHasLeftWhileDragging) {
            editting_tile_store.set(null);
            creatingNew = false;
            mouseHasLeftWhileDragging = false;
          }
        }}
      />
    </div>

    <div class="palette">
      <button
        class="clear-button"
        on:mouseenter={toggleOnDrop}
        on:mouseleave={toggleOffDrop}
        on:click={handleOpenSmallPaletteMenu}
      >
        Palette &nbsp;
        {#if dropArrow}
          <DownArrow />
        {/if}
      </button>
      <div class="recent-choices">
        {#each activePalette.colors as color, index}
          <div class="color-box">
            <button
              class="color-button"
              id={`brush-settings-color-button&${index}`}
              on:mousedown={() => {
                handleClickSmall(color, index);
              }}
              style="background-color: {color};"
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
  </div>
</div>

<style>
  .color-bar-3 {
    position: fixed;
    color: white;
    border-radius: 20px;
    height: 610px;
    background-color: rgb(25, 29, 31);
    left: 15px;
    padding: 20px;
    top: 50%;
    transform: translateY(-50%);
    display: none;
    flex-direction: column;
    border: 2px solid rgba(255, 255, 255, 0.198);
    width: 208px;
  }

  .isVisible {
    display: flex !important;
  }

  .content-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .color-container {
    border-bottom: 2px solid rgba(255, 255, 255, 0.198);
    padding-bottom: 15px;
  }

  .color-picker {
    margin-top: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .slider {
    border-bottom: 2px solid rgba(255, 255, 255, 0.198);
    padding-bottom: 10px;
  }

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
