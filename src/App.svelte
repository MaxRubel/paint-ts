<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import TextBox from "./components/Text_Box.svelte";
  import {
    createNewTextBox,
    textBoxesStore,
    updateTextBox,
    clearAllTextBoxes,
    deleteTextBox,
  } from "../stores/migmaStore";
  import { event_state_store, locked_store } from "../stores/eventState";
  import { theme_store } from "../stores/eventState";
  import type { TextBoxType } from "../utils/types/app_types";
  import { DrawRectangle } from "../utils/drawRectangle";
  import {
    DrawBrushStroke,
    EndBrushStroke,
    ReDrawBrushStrokes,
  } from "../utils/drawBrushStroke";
  import ToolBar from "./components/ToolBar.svelte";

  let mode = "dark";
  let catSmootch = false;
  let canvas: any;
  let ctx: CanvasRenderingContext2D;
  let size = 7;
  let textBoxes: { [key: string]: TextBoxType };
  let cursor = "arrow";
  let event_state = "arrow";
  let selected: string | null;
  let xStart = 0;
  let yStart = 0;
  let locked = true;

  const unsubcribe = textBoxesStore.subscribe((value) => {
    textBoxes = value;
  });

  const unsubcribe2 = event_state_store.subscribe((value: string) => {
    event_state = value;
  });

  const unsubscribe3 = theme_store.subscribe((value: string) => {
    mode = value;
  });

  const unsubscribe4 = locked_store.subscribe((value: boolean) => {
    locked = value;
  });

  //handle cursor type:
  $: {
    switch (event_state) {
      case "createTextBox":
        cursor = "text";
        break;
      case "drawing":
        cursor = "crosshair";
        break;
      case "arrow":
        cursor = "default";
        break;
      case "rectangle-draw":
        cursor = "crosshair";
        break;
    }
  }

  clearAllTextBoxes;
  const handleClick = (e: MouseEvent) => {
    switch (event_state) {
      case "createTextBox":
        createNewTextBox(e, canvas.offsetHeight, canvas.offsetWidth);
        break;
    }
  };

  function handle_delete() {
    if (event_state.includes("typing")) return;
    deleteTextBox(selected);
  }

  function handleKeyup(e: KeyboardEvent) {
    if (event_state.includes("typing")) return;
    switch (e.key) {
      case "p":
        handle_drawing_mode();
        break;
      case "t":
        handle_textbox_mode();
        break;
      case "a":
        handle_arrow_mode();
        break;
      case "Delete":
        handle_delete();
        break;
      case "Backspace":
        handle_delete();
        break;
    }
  }

  onMount(() => {
    ctx = canvas?.getContext("2d");
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("keyup", handleKeyup);
    canvas?.addEventListener("click", handleClick);
    resizeCanvas();
  });

  onDestroy(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    unsubcribe();
    unsubcribe2();
    unsubscribe3();
    unsubscribe4();

    window.removeEventListener("resize", resizeCanvas);
    window.removeEventListener("keyup", handleKeyup);
    canvas?.removeEventListener("click", handleClick);
  });

  function resizeCanvas(): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redrawCanvas();
  }

  function redrawCanvas(): void {
    ctx.clearRect(0, 0, canvas?.width, canvas?.height);
    ReDrawBrushStrokes(ctx);
  }

  function handleClear(): void {
    textBoxes = {};
    ctx.clearRect(0, 0, canvas?.width, canvas?.height);
    clearAllTextBoxes();
  }

  function handleUndo(): void {
    redrawCanvas();
  }

  function handlePointerDown(e: PointerEvent): void {
    if (event_state === "drawing") {
      DrawBrushStroke(ctx, size, e);
    }
    if (event_state === "rectangle-draw" || event_state === "selecting") {
      xStart = e.clientX;
      yStart = e.clientY;
    }
  }

  function handlePointerUp(): void {
    if (event_state === "rectangle-draw") {
      //finish the rectangle drawing
    }
    if (event_state === "drawing") {
      EndBrushStroke();
    }
  }

  function handlePointerMove(e: PointerEvent) {
    if (e.buttons !== 1) return; //stop right click from drawing
    if (event_state === "drawing") {
      DrawBrushStroke(ctx, size, e);
    }
    if (event_state === "rectangle-draw") {
      DrawRectangle(ctx, canvas, e, xStart, yStart);
    }
  }

  function handleDark(): void {
    if (mode === "light") {
      theme_store.set("dark");
    } else {
      theme_store.set("light");
    }
    redrawCanvas();
  }

  let timeoutId: number;

  function handleLock(): void {
    locked ? locked_store.set(false) : locked_store.set(true);
  }

  function handleSmootches(): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    catSmootch = true;
    timeoutId = setTimeout(() => {
      catSmootch = false;
    }, 2600);
  }

  //----bottom-tool-bar-------------------
  function handle_textbox_mode(): void {
    if (event_state === "createTextBox") {
      event_state_store.set("arrow");
    } else {
      event_state_store.set("createTextBox");
    }
  }

  function handle_drawing_mode(): void {
    if (event_state === "drawing") {
      event_state_store.set("arrow");
    } else {
      event_state_store.set("drawing");
    }
  }

  function handle_new_rectangle(): void {
    event_state_store.set("rectangle-draw");
  }

  function handle_arrow_mode(): void {
    event_state_store.set("arrow");
  }

  function handleSelect(e: CustomEvent<string>) {
    if (e.detail) {
      const [_, id] = e.detail.split("&");
      selected = id;
    } else {
      selected = null;
    }
  }
</script>

<main>
  <ToolBar
    {handleUndo}
    {handle_arrow_mode}
    {handle_drawing_mode}
    {handle_new_rectangle}
    {handle_textbox_mode}
    {handleClear}
    {handleDark}
    {handleLock}
    {handleSmootches}
  />
  <div class="canvas-container">
    {#if catSmootch}
      <img src="/high5.webp" alt="meh" class="image" />
    {/if}
    {#each Object.values(textBoxes) as textBox (textBox.id)}
      <TextBox data={textBox} {updateTextBox} on:select={handleSelect} />
    {/each}
    <canvas
      style="cursor: {cursor}"
      class="full-size"
      class:light={mode === "light"}
      class:dark={mode === "dark"}
      bind:this={canvas}
      on:pointerdown={handlePointerDown}
      on:pointerup={handlePointerUp}
      on:pointermove={handlePointerMove}
    >
    </canvas>
  </div>
</main>

<style>
  .canvas-container {
    position: relative;
    height: 100vh;
    width: 100vw;
  }

  .image {
    filter: brightness(70%);
    position: fixed;
    top: 40px;
    left: 40px;
    z-index: 1000;
    height: 50vh;
  }

  .full-size {
    position: absolute;
    height: 100vh;
    width: 100vw;
    top: 0px;
    left: 0px;
  }

  canvas.light {
    background-color: lightblue;
  }

  canvas.dark {
    background-color: rgb(42, 50, 53);
  }
</style>
