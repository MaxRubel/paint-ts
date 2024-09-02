<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import TextBox from "./canvas elements/Text_Box.svelte";
  import {
    createNewTextBox,
    textBoxesStore,
    clearAllTextBoxes,
    deleteTextBox,
  } from "../../stores/textBoxStore";
  import {
    event_state_store,
    locked_store,
    selected_store,
  } from "../../stores/eventState";
  import { DrawRectangle } from "../../utils/drawRectangle";
  import {
    ClearOldPathData,
    DrawBrushStroke,
    SaveOriginalRaster,
    EndBrushStroke,
    InitCtx,
  } from "../../utils/drawBrushStroke";
  import {
    ClearSelectionRect,
    DrawSelectBox,
    initializeSelectBox,
  } from "../../utils/drawSelectBox";
  import handleCursor from "../../utils/handleCursor";
  import { ClearSelection } from "../../utils/clearSelection";
  import { get } from "svelte/store";
  import type { TextBoxMap } from "../../stores/textBoxStore";
  import { AddUndoItem, ClearUndoStore } from "../../stores/undoStore";
  import BrushSettings from "./toolbars/BrushSettings.svelte";
  import TextSettings from "./toolbars/TextSettings.svelte";
  import NavMenu from "./menus/NavMenu.svelte";
  import { ClearRedoItems } from "../../stores/redoStore";
  import MultiplayerDebug from "./menus/MultiplayerDebug.svelte";
  import UndoRedoBottom from "./toolbars/UndoRedoBottom.svelte";
  import TopToolBar from "./toolbars/TopToolBar.svelte";
  import EraserSettings from "./toolbars/EraserSettings.svelte";
  import DrawingRoomDataHandler from "./DrawingRoomDataHandler.svelte";
  import DebugMenu from "./menus/DebugMenu.svelte";

  export let drawingRoomId = null;

  let canvas: any;
  let ctx: CanvasRenderingContext2D;

  let textBoxes: TextBoxMap;
  let cursor = "arrow";
  let event_state: string;
  let selected: string = "";
  let xStart = 0;
  let yStart = 0;
  let locked = true;

  let oldState: string;
  let iAmDrawing = false;
  let mouseHasLeft = false;

  $: textBoxes = $textBoxesStore;
  $: event_state = $event_state_store as string;
  $: locked = $locked_store as boolean;

  $: {
    cursor = handleCursor(event_state, cursor);
  }

  const handleClick = (e: MouseEvent) => {
    switch (event_state) {
      case "creating_text":
        const textBoxId = createNewTextBox(
          e,
          canvas.offsetHeight,
          canvas.offsetWidth,
        );
        AddUndoItem({
          action: "created_text_box",
          data: textBoxId,
        });
        break;
    }
  };

  function handle_delete() {
    if (event_state.includes("typing")) return;

    const selectedArray = get(selected_store);
    const undoArray = [];

    if (selectedArray.length > 0) {
      selectedArray.forEach((textElement) => {
        const [_, id] = textElement.id.split("&");
        const thisTextbox = get(textBoxesStore)[id];
        undoArray.push(thisTextbox);
        deleteTextBox(id);
        ClearSelection();
      });
      event_state_store.set("arrow");
    } else {
      const thisTextbox = get(textBoxesStore)[selected];
      undoArray.push(thisTextbox);
      deleteTextBox(selected);
    }

    AddUndoItem({ action: "deleted", data: undoArray });
  }

  function handleKeyup(e: KeyboardEvent) {
    if (event_state.includes("typing") || event_state.includes("form")) return;
    if ((e.target as HTMLInputElement).id === "font-size-input-box") return;

    switch (e.key) {
      case "d":
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
    ctx = canvas.getContext("2d", { alpha: true });
    InitCtx(ctx);
    window.addEventListener("keyup", handleKeyup);
    canvas.width = 3000;
    canvas.height = 2000;
  });

  onDestroy(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    window.removeEventListener("keyup", handleKeyup);
  });

  export function handleClear(): void {
    ctx.clearRect(0, 0, canvas?.width, canvas?.height);
    clearAllTextBoxes();
    ClearOldPathData();
    ClearUndoStore();
    ClearRedoItems();
  }

  function handlePointerDown(e: PointerEvent): void {
    oldState = event_state;
    mouseHasLeft = false;

    if (e.buttons === 2) {
      event_state_store.set("erasing");
    }

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
        iAmDrawing = true;
        SaveOriginalRaster();
        DrawBrushStroke(ctx, e);
        break;
      case "erasing":
        iAmDrawing = true;
        SaveOriginalRaster();
        DrawBrushStroke(ctx, e);
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
        if (mouseHasLeft) return;
        DrawBrushStroke(ctx, e);
        break;
      case "erasing":
        if (mouseHasLeft) return;
        DrawBrushStroke(ctx, e);
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
        if (mouseHasLeft) return;
        EndBrushStroke();
        iAmDrawing = false;
        break;
      case "erasing":
        if (mouseHasLeft) return;
        EndBrushStroke();
        iAmDrawing = false;
        break;
      case "selecting":
        ClearSelectionRect();
        event_state_store.set("selected");
        if (get(selected_store).length === 0) {
          event_state_store.set("arrow");
        }
        break;
      case "erasing":
        event_state_store.set(oldState);
    }
  }

  let timeoutId: NodeJS.Timeout;

  function handleLock(): void {
    locked ? locked_store.set(false) : locked_store.set(true);
  }

  //----bottom-tool-bar-------------------
  function handle_textbox_mode(): void {
    ClearSelection();
    event_state_store.set("creating_text");
  }

  function handle_drawing_mode(): void {
    ClearSelection();
    event_state_store.set("drawing");
  }

  function handle_arrow_mode(): void {
    ClearSelection();
    event_state_store.set("arrow");
  }

  let colorBarisOpen = false;
  $: {
    if (
      event_state === "drawing" ||
      event_state.includes("typing") ||
      event_state === "creating_text"
    ) {
      colorBarisOpen = true;
    } else {
      colorBarisOpen = false;
    }
    if (event_state === "selected") {
      const selected = get(selected_store);
      selected.forEach((item) => {
        if (item.id.includes("textbox")) {
          colorBarisOpen = true;
        }
      });
    }
  }

  $: {
    if (mouseHasLeft && iAmDrawing) {
      EndBrushStroke();
    }
  }
</script>

<main>
  {#if drawingRoomId}
    <DrawingRoomDataHandler />
  {/if}
  <DebugMenu />
  <NavMenu {handleClear} />
  <MultiplayerDebug />
  <TopToolBar
    {handle_arrow_mode}
    {handle_drawing_mode}
    {handle_textbox_mode}
    {handleLock}
  />
  <div class="canvas-container">
    {#each Object.entries(textBoxes) as [id, textBox] (id)}
      {#if textBox}
        <TextBox data={textBox} />
      {/if}
    {/each}
    <canvas
      id="main-canvas"
      style="cursor: {cursor}"
      class="full-size"
      bind:this={canvas}
      on:click={handleClick}
      on:pointerdown={handlePointerDown}
      on:pointerup={handlePointerUp}
      on:pointermove={handlePointerMove}
      on:pointerleave={() => {
        mouseHasLeft = true;
      }}
    >
    </canvas>
    <BrushSettings />
    <EraserSettings />
    <TextSettings />
    <UndoRedoBottom />
  </div>
</main>

<style>
  .canvas-container {
    position: relative;
    width: 100%;
    height: 100vh;
  }

  #main-canvas {
    width: 3000px;
    height: 2000px;
    background-color: transparent;
  }
</style>
