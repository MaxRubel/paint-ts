<script>
  // @ts-nocheck

  import { onDestroy, onMount } from "svelte";
  import { event_state_store } from "../../stores/eventState";
  import Slider from "./Slider.svelte";
  import iro from "@jaames/iro";
  import { color_store } from "../../stores/colorStore";
  import { get } from "svelte/store";

  let arrayOfColors = [];
  let eventState;
  let colorPicker;
  let isVisible;

  const unsubcribe = event_state_store.subscribe((value) => {
    eventState = value;
  });

  function handleChangeColor(origin) {
    let newColorF;
    if (origin === "box") {
      const newColor = colorPicker.color.rgb;
      newColorF = `rgb(${newColor.r}, ${newColor.g}, ${newColor.b})`;
    } else {
      newColorF = origin;
    }

    color_store.set(newColorF);
    const eventState = get(event_state_store);

    if (eventState === "selected") {
      const selectedArray = get(selected_store);
      const undoArray = [];
      selectedArray.forEach((item) => {
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

    if (arrayOfColors.includes(newColorF)) return;

    if (arrayOfColors.length === 16) {
      arrayOfColors.shift();
      arrayOfColors = arrayOfColors;
    }
    arrayOfColors.push(newColorF);
    arrayOfColors = arrayOfColors;
  }

  onDestroy(unsubcribe);

  onMount(() => {
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
    if (eventState === "drawing") {
      isVisible = true;
    } else {
      isVisible = false;
    }
  }
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
        on:mouseup={() => {
          handleChangeColor("box");
        }}
      />
    </div>

    <div class="palette">
      Palette
      <div class="recent-choices">
        {#each arrayOfColors as color}
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
    </div>
  </div>
</div>

<style>
  .color-bar-3 {
    position: fixed;
    color: white;
    border-radius: 20px;
    height: 548px;
    background-color: rgba(0, 0, 0, 0.266);
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
    padding: 10px;
    /* border: 1px solid rgba(255, 255, 255, 0.731); */
    border-radius: 10pt;
    flex-grow: 1;
    width: 170px;
    gap: 5px;
    align-content: start;
    height: 100%;
  }

  .color-button {
    width: 30px;
    height: 30px;
  }
</style>
