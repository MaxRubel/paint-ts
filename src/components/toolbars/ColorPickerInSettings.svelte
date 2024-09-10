<script lang="ts">
  import { onMount } from "svelte";
  import {
    active_color_store,
    active_palette_store,
    border_index_store,
    editting_tile_store,
    PushColorIntoActivePalette,
    UpdateColorTile,
    type PaletteType,
  } from "../../../stores/paletteStore";
  import { get } from "svelte/store";
  import { event_state_store, selected_store } from "../../../stores/eventState";
  import { textBoxesStore, updateTextBox } from "../../../stores/textBoxStore";
  import { AddUndoItem, undo_store } from "../../../stores/undoStore";
  import { authStore } from "../../../utils/auth/auth_store";
  import type { TextBoxType } from "../../../utils/types/app_types";
  import iro from "@jaames/iro";

  export let location;
  export let width;

  let colorPicker: any;
  let auth: any;
  let activePalette: PaletteType;
  let edittingTile: number | null;
  let activeColor: string;
  let draggingColor = false;
  let mouseHasLeftWhileDragging = false;
  let eventState: string;

  $: eventState = $event_state_store;
  $: auth = $authStore.user;
  $: activePalette = $active_palette_store;
  $: edittingTile = $editting_tile_store;
  $: activeColor = $active_color_store;

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
          },
        },
      ],
      layoutDirection: location === "text-color-picker" ? "horizontal" : "vertical",
    });
  });

  function handleChangeColor() {
    //format the color
    const newColor = colorPicker.color.rgb;
    const newColorF = `rgb(${newColor.r}, ${newColor.g}, ${newColor.b})`;

    // if active palette has this color, no need to do anything
    if (activePalette.colors.includes(newColorF) && edittingTile !== null) {
      return;
    }

    //make this color active
    active_color_store.set(newColorF);

    const eventState = get(event_state_store);

    //change color of selected items
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

      if (!draggingColor) {
        AddUndoItem({
          action: "changedManyFontColors",
          data: undoArray,
        });
      }
    }

    //just change the color that is selected
    if (edittingTile !== null) {
      if (edittingTile > 15) {
        //last one
        UpdateColorTile(newColorF, 15);
        return;
      } else {
        UpdateColorTile(newColorF, edittingTile);
        return;
      }
    } else {
      //fires on first mouse down
      if (activePalette.colors.length > 15) {
        //last one
        editting_tile_store.set(activePalette.colors.length - 1);
      } else {
        editting_tile_store.set(activePalette.colors.length);
      }
    }

    if (activePalette.id) return;
    console.log("hehehehe");
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
      if (edittingTile === null && eventState.includes("color_palette_edit_form")) {
        editting_tile_store.set(activePalette.colors.length);
      }
      border_index_store.set(edittingTile);
      handleChangeColor();
      draggingColor = true;
    }}
    on:mousemove={() => {
      if (draggingColor) {
        handleChangeColor();
      }
    }}
    on:mouseleave={() => {
      if (draggingColor) {
        mouseHasLeftWhileDragging = true;
      }
    }}
    on:mouseenter={() => {
      if (draggingColor && mouseHasLeftWhileDragging) {
        mouseHasLeftWhileDragging = false;
      }
    }}
    on:pointerup={() => {
      border_index_store.set(edittingTile);
      if (edittingTile) {
        active_color_store.set(activePalette.colors[edittingTile]);
      }
      if (draggingColor || mouseHasLeftWhileDragging) {
        draggingColor = false;
        mouseHasLeftWhileDragging = false;
      }
      if (!eventState.includes("color_palette_edit_form")) {
        editting_tile_store.set(null);
        active_color_store.set(activeColor);
      }
      if (eventState === "selected" || eventState.includes("typing")) {
        handleChangeColor();
      }
      draggingColor = false;
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
