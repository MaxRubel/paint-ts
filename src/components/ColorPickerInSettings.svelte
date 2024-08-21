<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    active_color_store,
    active_palette_store,
    border_index_store,
    editting_tile_store,
    PushColorIntoActivePalette,
    UpdateColorTile,
    type PaletteType,
  } from "../../stores/paletteStore";
  import { get } from "svelte/store";
  import { event_state_store, selected_store } from "../../stores/eventState";
  import { textBoxesStore, updateTextBox } from "../../stores/textBoxStore";
  import { AddUndoItem } from "../../stores/undoStore";
  import { authStore } from "../../utils/auth/auth_store";
  import type { TextBoxType } from "../../utils/types/app_types";
  import iro from "@jaames/iro";

  export let location;
  export let width;

  let colorPicker: any;
  let auth: any;
  let activePalette: PaletteType;
  let edittingTile: number | null;
  let activeColor: string;
  let draggingColor: Boolean;
  let creatingNew = false;
  let mouseHasLeftWhileDragging = false;
  let eventState: string;

  const unsubcribe = event_state_store.subscribe((value: string) => {
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

  const unsubscribe5 = active_color_store.subscribe((value) => {
    activeColor = value;
  });

  onDestroy(() => {
    unsubcribe();
    unsubcribe2();
    unsubscribe3();
    unsubscribe4();
    unsubscribe5();
  });

  onMount(() => {
    // @ts-ignore
    colorPicker = new iro.ColorPicker(`#${location}`, {
      width,
      layout: [
        {
          component: iro.ui.Box,
        },
        {
          component: iro.ui.Slider,
          options: {
            sliderType: "hue",
            direction: "vertical",
            width,
            // width: 200,
            // height: 20,
          },
        },
      ],
      layoutDirection: location === "text-color-picker" ? "horizontal" : "vertical",
    });
  });

  function handleChangeColor(origin: string) {
    const newColor = colorPicker.color.rgb;
    const newColorF = `rgb(${newColor.r}, ${newColor.g}, ${newColor.b})`;
    active_color_store.set(newColorF);
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
    border_index_store.set(get(active_palette_store).colors.length - 1);
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
</script>

<div
  style="margin-top: 10px; flex-direction: column"
  class="centered color-container"
>
  Color
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="color-picker"
    id={location}
    on:pointerdown={() => {
      draggingColor = true;
      if (edittingTile === null) {
        creatingNew = true;
        editting_tile_store.set(activePalette.colors.length);
        border_index_store.set(activePalette.colors.length);
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
      // active_color_store.set(activePalette.colors[edittingTile]);
      if (creatingNew && eventState.includes("color_palette_edit_form")) {
        console.log("hi");
      }
      if (creatingNew || mouseHasLeftWhileDragging) {
        border_index_store.set(edittingTile);
        // editting_tile_store.set(null);
        creatingNew = false;
        mouseHasLeftWhileDragging = false;
      }
    }}
  />
</div>

<style>
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
</style>
