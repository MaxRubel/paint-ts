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
    editting_tile_store,
    PushColorIntoActivePalette,
    UpdateColorTile,
  } from "../../stores/paletteStore";
  import type { PaletteType } from "../../stores/paletteStore";
  import { updateTextBox, textBoxesStore } from "../../stores/textBoxStore";
  import { AddUndoItem } from "../../stores/undoStore";
  import type { TextBoxType } from "../../utils/types/app_types";

  let eventState: string = "";
  let colorPicker: any;
  let isVisible: boolean = false;
  let auth: any;
  let activePalette: PaletteType;
  let draggingColor: Boolean;
  let color: string;
  let edittingTile: number | null;

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
      PushColorIntoActivePalette(newColorF);
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
            undoArray.push({
              id,
              fontColor: ogTextbox.fontColor,
            });
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

  function openPaletteWindow() {
    event_state_store.set("color_palette_form&drawing");
  }

  onDestroy(() => {
    unsubcribe();
    unsubcribe2();
    unsubscribe3();
    unsubscribe4();
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
</script>

<div class="color-bar-3" class:isVisible>
  <div class="content-wrapper">
    <div class="slider centered" style="flex-direction: column">
      Stroke
      <div class="centered" style="margin-top: 5px;"><Slider /></div>
    </div>
    <div style="margin-top: 10px; flex-direction: column" class="centered color-container">
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
        on:pointerup={() => {
          handleChangeColor("box");
          draggingColor = false;
          //@ts-ignore
          color_store.set(activePalette.colors[edittingTile]);
          if (creatingNew) {
            editting_tile_store.set(null);
            creatingNew = false;
          }
        }}
      />
    </div>

    <div class="palette">
      Palette
      <div class="recent-choices">
        {#each activePalette.colors as color}
          <div class="color-box">
            <button
              class="color-button"
              on:click={() => {
                handleChangeColor(color);
              }}
              style="background-color: {color};"
            ></button>
          </div>
        {/each}
      </div>
      {#if auth?.id}
        <button class="clear-button centered" on:click={openPaletteWindow}> Edit </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .color-bar-3 {
    position: fixed;
    color: white;
    border-radius: 20px;
    height: 590px;
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
    /* padding: 10px; */
    /* border: 1px solid rgba(255, 255, 255, 0.731); */
    border-radius: 10pt;
    flex-grow: 1;
    width: 180px;
    gap: 5px;
    align-content: start;
    /* height: 100%; */
  }

  .color-button {
    width: 30px;
    height: 30px;
  }
</style>
