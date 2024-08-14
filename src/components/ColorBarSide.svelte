<script>
  // @ts-nocheck

  import { onMount } from "svelte";
  import TextCenter from "../graphics/TextCenter.svelte";
  import TextLeft from "../graphics/TextLeft.svelte";
  import TextRight from "../graphics/TextRight.svelte";
  import iro from "@jaames/iro";

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
      width: 110,
    });
  });

  function handleMouseDown() {
    oldColor = colorPicker.color.rgb;
  }

  function handleMouseUp() {
    newColor = colorPicker.color.rgb;
    if (arrayOfColors.length === 12) {
      arrayOfColors.shift();
      arrayOfColors = arrayOfColors;
    }
    arrayOfColors.push(`rgb(${newColor.r},${newColor.g}, ${newColor.b} `);
    arrayOfColors = arrayOfColors;
  }
</script>

<div class="color-bar" class:colorBarisOpen>
  <div class="tool-box">
    <div class="text-position-container">
      Align
      <div class="text-position">
        <button> <TextLeft /> </button>
        <button><TextCenter /></button>
        <button><TextRight /></button>
      </div>
    </div>
    <div class="font-container">
      Font
      <select class="font-box" name="" id="">
        <option class="font-box" value="arial">Arial</option>
        <option class="font-box" value="comic-sans">Comic-Sans</option>
        <option class="font-box" value="comic-sans">Helvettica</option>
      </select>
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
            <button class="color" style="background-color: {color}"></button>
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
  }

  .color-bar {
    background-color: rgba(0, 0, 0, 0.288);
    width: 159px;
    position: fixed;
    height: 100%;
    left: 0;
    top: 60px;
    bottom: 0;
    opacity: 0;
    transition: all ease 0.3s;
    transform: translateX(0);
    z-index: 400;
    display: flex;
    justify-content: center;
    padding: 15px;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
  }

  .colorBarisOpen {
    opacity: 1;
  }

  .text-position-container {
    margin-top: 2px;
  }

  .tool-box {
    background-color: rgb(211, 211, 211);
    border-radius: 10px;
    margin-top: 60px;
    width: 100%;
    padding: 6px;
    padding-top: 6px;
    display: flex;
    flex-direction: column;
    height: 560px;
    border: 2px solid black;
    text-align: center;
  }

  .text-position {
    height: 44px;
    display: flex;
    margin-top: 4px;
    gap: 6px;
    justify-content: center;
    margin-top: 4px;
  }

  .font-container {
    margin-top: 15px;
    text-align: center;
  }

  .font-box {
    width: 100%;
    padding: 5px;
    border-radius: 5px;
    border: none;
    outline: none;
    margin-top: 4px;
  }

  .font-box:active,
  .font-box:focus {
    border: none;
    outline: none;
  }

  .color-container {
    margin-top: 15px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    opacity: 0.8;
  }

  .recent-choices {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    margin-top: 15px;
    flex-grow: 1;
  }

  .choices-container {
    width: 100%;
    height: 100%;
    border-radius: 10px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 6px;
    /* padding: 6px; */
    place-items: center;
    align-content: start;
  }

  .color-box {
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 33px;
    height: 33px;
    border: 1px solid rgba(0, 0, 0, 0);
    border-radius: 10px;
    padding: 2px;
  }

  .color {
    background-color: rgb(0, 0, 255);
    opacity: 0.8;
    height: 100%;
    width: 100%;
    border-radius: 8px;
  }
</style>
