<script>
  // @ts-nocheck

  import { onDestroy, onMount } from "svelte";
  import TextCenter from "../graphics/TextCenter.svelte";
  import TextLeft from "../graphics/TextLeft.svelte";
  import TextRight from "../graphics/TextRight.svelte";
  import iro from "@jaames/iro";
  import { color_store } from "../../stores/colorStore";
  import {
    ChangeTextFont,
    text_alignment,
    textBoxesStore,
    updateTextBox,
  } from "../../stores/textBoxStore";
  import { get } from "svelte/store";
  import {
    event_state_store,
    selected_store,
    theme_store,
  } from "../../stores/eventState";
  import { AddUndoItem } from "../../stores/undoStore";

  export let colorBarisOpen = false;

  let colorPicker;
  let arrayOfColors = [];
  let colorStoreReturn;
  let eventState;

  function rgbStringToHex(rgbString) {
    // Use regex to extract the RGB values
    const rgbMatch = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

    if (!rgbMatch) {
      throw new Error('Invalid RGB string format. Expected "rgb(r, g, b)"');
    }

    // Convert the matched values to numbers
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);

    // Convert to hex and pad with zeros if necessary
    const toHex = (c) => {
      const hex = c.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    // Combine the hex values
    return "#" + toHex(r) + toHex(g) + toHex(b);
  }

  const unsubcribe = color_store.subscribe((value) => {
    if (!value) {
      const mode = get(theme_store);
      mode === "dark"
        ? (colorStoreReturn = "#D3D3D3")
        : (colorStoreReturn = "#D3D3D3");
    } else {
      colorStoreReturn = rgbStringToHex(value);
    }
  });

  const unsubcribe2 = event_state_store.subscribe((value) => {
    eventState = value;
  });
  onDestroy(() => {
    unsubcribe();
    unsubcribe2();
  });

  onMount(() => {
    // @ts-ignore
    colorPicker = new iro.ColorPicker("#picker", {
      width: 66,
      layout: [
        {
          component: iro.ui.Wheel,
        },
      ],
    });
    colorPicker.id = "colorpicker";
  });

  $: {
    if (colorPicker) {
      colorPicker.color.hexString = colorStoreReturn;
    }
  }

  function handleChangeColor(origin) {
    let newColorF;
    if (origin === "circle") {
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

    if (arrayOfColors.length === 12) {
      arrayOfColors.shift();
      arrayOfColors = arrayOfColors;
    }
    arrayOfColors.push(newColorF);
    arrayOfColors = arrayOfColors;
  }

  function handleAlignment(e) {
    const { id } = e.target;
    text_alignment.set(id);
    const eventState = get(event_state_store);
    if (eventState.includes("typing")) {
      const [, textboxid] = eventState.split("&");
      const oldAlign = get(textBoxesStore)[textboxid].align;
      updateTextBox(textboxid, { align: id });
      if (oldAlign !== id)
        AddUndoItem({
          action: "textBoxAligned",
          data: { id: textboxid, align: oldAlign },
        });
    }
  }

  function handleFontChange(e) {
    ChangeTextFont(e.target.value);
  }
</script>

<div class="color-bar" class:colorBarisOpen>
  <div class="hi">
    {#if eventState.includes("typing") || eventState === "drawing" || eventState === "creating_text"}
      <div class="text-position-container">
        <div class="align-box">
          Align
          <div class="text-position" style="margin-top: 11px">
            <button id="left" on:click={handleAlignment}> <TextLeft /> </button>
            <button id="center" on:click={handleAlignment}
              ><TextCenter /></button
            >
            <button id="right" on:click={handleAlignment}><TextRight /></button>
          </div>
        </div>
        <div class="font-container">
          Font
          <select
            class="font-box"
            style="width: 160px; margin-top: 22px"
            id=""
            on:change={handleFontChange}
          >
            <option class="font-box" value="Arial">Arial</option>
            <option class="font-box" value="Patrick Hand">Patrick Hand</option>
            <option class="font-box" value="Times New Roman"
              >Times New Roman</option
            >
          </select>
        </div>
      </div>
    {/if}
    <div class="color-container">
      Color
      <div style="margin-top: 6px;">
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          id="picker"
          on:mouseup={() => {
            handleChangeColor("circle");
          }}
        />
      </div>
    </div>
    <div class="recent-choices">
      Recent
      <div class="choices-container" style="margin-top: 6px;">
        {#each arrayOfColors as color}
          <div class="color-box">
            <button
              class="color-button"
              on:click={() => {
                handleChangeColor(color);
              }}
              style="background-color: {color}"
            ></button>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  button {
    width: 44px;
    height: 44px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px;
    background-color: transparent;
    color: rgba(255, 255, 255, 0.538);
    border: 1px solid;
  }

  .color-bar {
    width: 100%;
    position: fixed;
    height: 142px;
    left: 0;
    bottom: 0;
    transition: all ease 1s;
    z-index: 400;
    color: rgb(255, 255, 255);
    background-color: rgba(0, 0, 0, 0.288);
    opacity: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .colorBarisOpen {
    opacity: 1;
  }

  .text-position-container {
    text-align: center;
    display: flex;
    justify-content: center;
    /* align-items: center; */

    /* background-color: aliceblue; */
  }

  .hi {
    display: grid;
    width: 600px;
    grid-template-columns: 2fr 1fr 2fr;
  }

  .text-position {
    height: 44px;
    display: flex;
    margin-top: 4px;
    gap: 6px;
    justify-content: center;
    margin-top: 4px;
    padding: 3px;
  }

  .font-container {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .font-box {
    width: 100%;
    padding: 5px;
    border-radius: 5px;
    background-color: transparent;
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.538);
    outline: none;
    margin-top: 4px;
  }

  .font-box:active,
  .font-box:focus {
    border: 1px solid rgba(255, 255, 255, 0.538);
    outline: rgba(255, 255, 255, 0.538);
  }

  .color-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    /* opacity: 0.8; */
  }

  .recent-choices {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .choices-container {
    width: 100%;
    border-radius: 10px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    width: 190px;
    height: 96px;
    place-items: center;
    align-content: start;
    gap: 2px;
    padding: 4px;
    border: 1px solid rgba(255, 255, 255, 0.166);
  }

  .color-box {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 29px;
    border: 1px solid rgba(0, 0, 0, 0);
    border-radius: 10px;
  }

  .color-button {
    /* opacity: 0.8; */
    height: 100%;
    width: 100%;
    border-radius: 8px;
    border: none;
  }
</style>
