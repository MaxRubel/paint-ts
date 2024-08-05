<script>
  // @ts-nocheck

  import { onMount } from "svelte";
  import TextCenter from "../graphics/TextCenter.svelte";
  import TextLeft from "../graphics/TextLeft.svelte";
  import TextRight from "../graphics/TextRight.svelte";
  import iro from "@jaames/iro";
  import { color_store } from "../../stores/colorStore";
  import { text_alignment, updateTextBox } from "../../stores/textBoxStore";
  import { get } from "svelte/store";
  import { event_state_store } from "../../stores/eventState";

  export let colorBarisOpen = false;

  /**
   * @type {{ color: { rgb: {}; }; }}
   */
  let colorPicker;
  let oldColor = null;
  let newColor = null;

  /**
   * @type {any[]}
   */
  let arrayOfColors = [];

  onMount(() => {
    // @ts-ignore
    colorPicker = new iro.ColorPicker("#picker", {
      width: 66,
    });
  });

  function handleMouseDown() {
    oldColor = colorPicker.color.rgb;
  }

  function handleMouseUp() {
    newColor = colorPicker.color.rgb;
    const newColorF = `rgb(${newColor.r}, ${newColor.g}, ${newColor.b})`;

    color_store.set(newColorF);

    if (arrayOfColors.length === 12) {
      arrayOfColors.shift();
      arrayOfColors = arrayOfColors;
    }
    arrayOfColors.push(`rgb(${newColor.r},${newColor.g}, ${newColor.b} `);
    arrayOfColors = arrayOfColors;
  }

  function handleAlignment(e) {
    const { id } = e.target;
    text_alignment.set(id);
    const eventState = get(event_state_store);
    if (eventState.includes("typing")) {
      const [, textboxid] = eventState.split("&");
      updateTextBox(textboxid, { align: id });
    }
  }
</script>

<div class="color-bar" class:colorBarisOpen>
  <div class="hi">
    <div class="text-position-container">
      Align
      <div class="text-position">
        <button id="left" on:click={handleAlignment}> <TextLeft /> </button>
        <button id="center" on:click={handleAlignment}><TextCenter /></button>
        <button id="right" on:click={handleAlignment}><TextRight /></button>
      </div>
      <div class="font-container">
        Font
        <select class="font-box" style="width: 160px" id="">
          <option class="font-box" value="arial">Arial</option>
          <option class="font-box" value="comic-sans">Comic-Sans</option>
          <option class="font-box" value="comic-sans">Helvettica</option>
        </select>
      </div>
    </div>
    <div class="color-container">
      Color
      <div style="margin-top: 6px;">
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          id="picker"
          on:mousedown={handleMouseDown}
          on:mouseup={handleMouseUp}
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
              on:click={color_store.set(color)}
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
    display: grid;
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
  }

  .hi {
    display: grid;
    width: 600px;
    grid-template-columns: 1.6fr 1fr 2fr;
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
    justify-content: center;
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
    opacity: 0.8;
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
    opacity: 0.8;
    height: 100%;
    width: 100%;
    border-radius: 8px;
    border: none;
  }
</style>
