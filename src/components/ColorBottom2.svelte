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
    font_family_store,
    font_size_store,
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
  import DownArrow from "../graphics/Arrow.svelte";
  import {
    UpdateUserPrefs,
    user_prefs_store,
  } from "../../stores/userPrefsStore";
  import Arrow from "../graphics/Arrow.svelte";
  import { brush_size_store } from "../../stores/brushStore";
  import Slider from "./Slider.svelte";

  let colorPicker;
  let arrayOfColors = [];
  let colorStoreReturn;
  let eventState;
  let fontSize;
  let textAlignment;
  let fontFamily;
  let userPrefs;
  let brushSize;

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

  const unsubcribe3 = font_size_store.subscribe((value) => {
    fontSize = value;
  });

  const unsubscribe4 = text_alignment.subscribe((value) => {
    textAlignment = value;
  });

  const unsubscribe5 = font_family_store.subscribe((value) => {
    fontFamily = value;
  });

  const unsubscribe6 = user_prefs_store.subscribe((value) => {
    userPrefs = value;
  });

  const unsubscribe7 = brush_size_store.subscribe((value) => {
    brushSize = value;
  });

  onDestroy(() => {
    unsubcribe();
    unsubcribe2();
    unsubcribe3();
    unsubscribe4();
    unsubscribe5();
    unsubscribe6();
    unsubscribe7();
  });

  onMount(() => {
    // @ts-ignore
    colorPicker = new iro.ColorPicker("#picker", {
      width: 77,
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

    if (arrayOfColors.length === 15) {
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
      document.getElementById(`textbox&${textboxid}`).focus();
    }

    if (eventState === "selected") {
      const selectedArray = get(selected_store);
      const data = [];
      selectedArray.forEach((item) => {
        const [, textboxid] = item.id.split("&");
        const oldAlign = get(textBoxesStore)[textboxid].align;
        data.push({ id: textboxid, align: oldAlign });
        updateTextBox(textboxid, { align: id });
      });
      AddUndoItem({ action: "manyTextBoxAligned", data });
    }
  }

  function handleFontChange(e) {
    ChangeTextFont(e.target.value);
  }

  let oldFontSize = 24;
  function handleSizeChange(e) {
    const { value } = e.target;
    if (value < 8) return;
    font_size_store.set(value);

    if (eventState.includes("typing")) {
      const [, id] = eventState.split("&");
      updateTextBox(id, { fontSize: value });
      AddUndoItem({
        action: "changedFontSizes",
        data: [{ id, oldFontSize }],
      });
    }

    if (eventState === "selected") {
      const data = [];
      get(selected_store).forEach((item) => {
        const [, id] = item.id.split("&");
        updateTextBox(id, { fontSize: value });
        data.push({ id, oldFontSize });
      });
      AddUndoItem({ action: "changedFontSizes", data });
    }
    oldFontSize = value;
  }

  function handleToggleVisible() {
    if (userPrefs.colorBarVisible) {
      UpdateUserPrefs({ colorBarVisible: false });
    } else {
      UpdateUserPrefs({ colorBarVisible: true });
    }
  }

  function changeBrushSize(e) {
    const { value } = e.target;
    if (value > 0) {
      brush_size_store.set(value);
    }
  }
</script>

<div
  class="color-bar"
  style="bottom: {userPrefs.colorBarVisible ? '0px' : '-130px'}"
>
  <button class="toggle-button" on:click={handleToggleVisible}>
    <Arrow colorBarVisible={userPrefs.colorBarVisible} />
  </button>
  <div class="hi">
    {#if eventState === "drawing"}
      <div class="brush-size-container" style="flex-direction: column;">
        <div>Brush Size</div>
        <div class="centered" style="height: 90px;">
          <Slider />
        </div>
      </div>
    {:else}
      <div class="text-position-container">
        <div class="align-box">
          Align
          <div class="text-position" style="margin-top: 0px">
            <button
              id="left"
              style={textAlignment === "left" && "color: white;"}
              on:click={handleAlignment}
            >
              <TextLeft />
            </button>
            <button
              id="center"
              style={textAlignment === "center" && "color: white;"}
              on:click={handleAlignment}><TextCenter /></button
            >
            <button
              id="right"
              style={textAlignment === "right" && "color: white;"}
              on:click={handleAlignment}><TextRight /></button
            >
          </div>
        </div>
        <div class="font-container">
          Font
          <select
            class="font-box"
            id=""
            value={fontFamily}
            on:click={handleFontChange}
            on:change={handleFontChange}
          >
            <option class="font-box" value="Arial">Arial</option>
            <option class="font-box" value="Patrick Hand">Patrick Hand</option>
            <option class="font-box" value="Times New Roman"
              >Times New Roman</option
            >
          </select>
          <div class="size-container">
            <div>Size</div>
            <div>
              <input
                type="number"
                id="font-size-input-box"
                class="font-box"
                on:input={handleSizeChange}
                value={fontSize}
                style="width: 140px; height: 24px"
              />
            </div>
          </div>
        </div>
      </div>
    {/if}
    <div class="color-container">
      Color
      <div class="color-wheel-border">
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
      <div class="choices-container" style="margin-top: 4px;">
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
  button {
    width: 44px;
    height: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px;
    background-color: transparent;
    color: rgba(255, 255, 255, 0.538);
    border: 1px solid;
  }

  .toggle-button {
    position: absolute;
    top: -40px;
    right: 5px;
    color: white;
  }

  .toggle-button:hover {
    color: rgb(255, 165, 255);
    transition: all ease 0.3s;
  }

  .color-bar {
    width: 100%;
    position: fixed;
    height: 130px;
    left: 0;
    bottom: 0;
    transition: all ease 1s;
    z-index: 400;
    color: rgb(255, 255, 255);
    background-color: rgba(0, 0, 0, 0.475);
    opacity: 1;
  }

  /* .colorBarisOpen {
    opacity: 1;
  } */

  .text-position-container {
    text-align: center;
    display: flex;
    justify-content: space-evenly;
  }
  .brush-size-container {
    display: flex;
    align-items: center;
    flex-direction: column;
  }
  .hi {
    display: grid;
    grid-template-columns: 2fr 1fr 2fr;
  }

  .text-position {
    height: 44px;
    display: flex;
    gap: 6px;
    justify-content: center;
    padding: 3px;
  }

  .font-container {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .font-box {
    /* width: 100%; */
    padding: 5px;
    padding-top: 3px;
    border-radius: 5px;
    background-color: transparent;
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.538);
    outline: none;
    margin-top: 4px;
    height: 36px;
    width: 150px;
    /* background-color: red; */
  }

  /* .size-input {
    width: 100%;
    padding: 5px;
    border-radius: 5px;
    background-color: transparent;
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.538);
    outline: none;
    margin-top: 4px;
  } */

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
    grid-template-columns: repeat(5, 1fr);
    width: 260px;
    height: 88px;
    gap: 2px;
    padding: 4px;
    border: 1px solid rgba(255, 255, 255, 0.538);
  }

  .color-wheel-border {
    margin-top: 13px;
    /* width: 122px;
    height: 100px; */
    /* border: 1px solid rgba(255, 255, 255, 0.284);
    padding: 0px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center; */
  }

  .color-box {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 44px;
    height: 25px;
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
