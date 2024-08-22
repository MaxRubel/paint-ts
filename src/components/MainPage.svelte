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
  import DebugMenu from "./menus/DebugMenu.svelte";
  import MultiplayerDebug from "./menus/MultiplayerDebug.svelte";
  import UndoRedoBottom from "./toolbars/UndoRedoBottom.svelte";
  import TopToolBar from "./toolbars/TopToolBar.svelte";

  let canvas: any;
  let ctx: CanvasRenderingContext2D;
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

  const unsubscribe3 = locked_store.subscribe((value: boolean) => {
    locked = value;
  });

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
    ctx = canvas.getContext("2d");
    InitCtx(ctx);
    window.addEventListener("keyup", handleKeyup);
    canvas?.addEventListener("click", handleClick);
    canvas.width = 3000;
    canvas.height = 2000;
    // resizeCanvas();
  });

  onDestroy(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    unsubcribe();
    unsubcribe2();
    unsubscribe3();

    window.removeEventListener("keyup", handleKeyup);
    canvas?.removeEventListener("click", handleClick);
  });

  export function handleClear(): void {
    ctx.clearRect(0, 0, canvas?.width, canvas?.height);
    clearAllTextBoxes();
    ClearOldPathData();
    ClearUndoStore();
    ClearRedoItems();
  }

  let oldState: string;

  function handlePointerDown(e: PointerEvent): void {
    oldState = event_state;
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
        SaveOriginalRaster();
        DrawBrushStroke(ctx, e);
        break;
      case "erasing":
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
        DrawBrushStroke(ctx, e);
        break;
      case "erasing":
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
        EndBrushStroke();
        AddUndoItem;
        break;
      case "erasing":
        EndBrushStroke();
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

  function handle_new_rectangle(): void {
    ClearSelection();
    event_state_store.set("rectangle-draw");
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
</script>

<main>
  <NavMenu {handleClear} />
  <MultiplayerDebug />
  <DebugMenu />
  <TopToolBar
    {handle_arrow_mode}
    {handle_drawing_mode}
    {handle_textbox_mode}
    {handleLock}
  />
  <div class="canvas-container">
    {#each Object.values(textBoxes) as textBox (textBox.id)}
      <TextBox data={textBox} />
    {/each}
    <canvas
      id="main-canvas"
      style="cursor: {cursor}"
      class="full-size"
      bind:this={canvas}
      on:pointerdown={handlePointerDown}
      on:pointerup={handlePointerUp}
      on:pointermove={handlePointerMove}
    >
    </canvas>
    <BrushSettings />
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
  }
</style>
