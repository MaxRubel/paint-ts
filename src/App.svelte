<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import TextBox from "./components/Text_Box.svelte";
  import {
    createNewTextBox,
    textBoxesStore,
    updateTextBox,
    clearAllTextBoxes,
    deleteTextBox,
  } from "../stores/textBoxStore";
  import {
    event_state_store,
    locked_store,
    selected_store,
  } from "../stores/eventState";
  import { theme_store } from "../stores/eventState";
  import { DrawRectangle } from "../utils/drawRectangle";
  import {
    ClearOldPathData,
    DrawBrushStroke,
    EndBrushStroke,
    InitCtx,
    ReDrawBrushStrokes,
  } from "../utils/drawBrushStroke";
  import ToolBar from "./components/ToolBar.svelte";
  import {
    ClearSelectionRect,
    DrawSelectBox,
    initializeSelectBox,
  } from "../utils/drawSelectBox";
  import handleCursor from "../utils/handleCursor";
  import { ClearSelection } from "../utils/clearSelection";
  import { get } from "svelte/store";
  import type { TextBoxMap } from "../stores/textBoxStore";
  import { AddUndoItem, ClearUndoStore } from "../stores/undoStore";

  let mode = "dark";
  let catSmootch = false;
  let canvas: any;
  let ctx: CanvasRenderingContext2D;
  let size = 7;
  let textBoxes: TextBoxMap;
  let cursor = "arrow";
  let event_state = "arrow";
  let selected: string = "";
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

  $: {
    cursor = handleCursor(event_state, cursor);
  }

  const handleClick = (e: MouseEvent) => {
    switch (event_state) {
      case "createTextBox":
        createNewTextBox(e, canvas.offsetHeight, canvas.offsetWidth);
        break;
    }
  };

  function handle_delete() {
    if (event_state.includes("typing")) return;
    const selectedArray = get(selected_store);
    if (selectedArray.length > 0) {
      selectedArray.forEach((textElement) => {
        const [_, id] = textElement.id.split("&");
        deleteTextBox(id);
        ClearSelection();
        event_state_store.set("arrow");
      });
    } else deleteTextBox(selected);
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
    InitCtx(ctx);
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
    ReDrawBrushStrokes();
  }

  function handleClear(): void {
    ctx.clearRect(0, 0, canvas?.width, canvas?.height);
    clearAllTextBoxes();
    ClearOldPathData();
    ClearUndoStore();
  }

  function handlePointerDown(e: PointerEvent): void {
    function startSelecting() {
      xStart = e.clientX;
      yStart = e.clientY;
      event_state_store.set("selecting");
      initializeSelectBox(canvas);
    }
    if (event_state.includes("typing")) {
      event_state_store.set("arrow");
    }
    switch (event_state) {
      case "selected":
        if ((e.target as HTMLElement)?.id === "main-canvas") {
          ClearSelection();
          startSelecting();
        }
        break;
      case "drawing":
        DrawBrushStroke(ctx, size, e);
        break;
      case "rectangle-draw":
        xStart = e.clientX;
        yStart = e.clientY;
        break;
      case "arrow":
        startSelecting();
        break;
    }
  }

  function handlePointerMove(e: PointerEvent) {
    if (e.buttons !== 1) return; //stop right click from drawing

    switch (event_state) {
      case "drawing":
        DrawBrushStroke(ctx, size, e);
        break;
      case "rectangle-draw":
        DrawRectangle(ctx, canvas, e, xStart, yStart);
        break;
      case "selecting":
        DrawSelectBox(e, xStart, yStart);
        break;
    }
  }

  function handlePointerUp(e: any): void {
    switch (event_state) {
      case "drawing":
        EndBrushStroke();
        AddUndoItem;
        break;
      case "selecting":
        ClearSelectionRect();
        event_state_store.set("selected");
        if (get(selected_store).length === 0) {
          event_state_store.set("arrow");
        }
        break;
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
    ClearSelection();
    event_state_store.set("createTextBox");
  }

  function handle_drawing_mode(): void {
    ClearSelection();
    event_state_store.set("drawing");
  }

  function handle_new_rectangle(): void {
    ClearSelection();
    event_state_store.set("rectangle-draw");
  }

  function handle_arrow_mode(): void {
    ClearSelection();
    event_state_store.set("arrow");
  }
</script>

<main>
  <ToolBar
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
      <TextBox data={textBox} {updateTextBox} />
    {/each}
    <canvas
      id="main-canvas"
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
