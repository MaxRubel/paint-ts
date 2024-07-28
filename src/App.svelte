<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { getSvgPathFromStroke } from "../utils/getSvgPathFromStroke";
  import { getStroke } from "perfect-freehand";
  import TextBox from "./components/Text_Box.svelte";
  import {
    createNewTextBox,
    textBoxesStore,
    updateTextBox,
    clearAllTextBoxes,
    deleteTextBox,
  } from "../stores/migmaStore";
  import Marker from "./graphics/Marker.svelte";
  import TextIcon from "./graphics/TextIcon.svelte";
  import { event_state_store } from "../stores/eventState";
  import CursorPointer from "./graphics/CursorPointer.svelte";
  import { theme_store } from "../stores/eventState";
  import type { TextBoxType, RectangleType } from "../utils/types/app_types";
  import Rectangle from "./graphics/Rectangle.svelte";

  let points: any[] = [];
  let paths: any[] = [];
  let moves: any[] = [];
  let mode = "dark";
  let pathData;
  let catSmootch = false;

  let start = 0;
  let end: number | null = null;
  let canvas: any;
  let ctx: any;
  let size = 7;
  let textBoxes: { [key: string]: TextBoxType };
  let cursor = "arrow";
  let event_state = "arrow";
  let selected: string | null;

  let rectData: RectangleType;

  let xStart = 0;
  let yStart = 0;

  let fillColor = mode === "light" ? "black" : "rgb(143, 143, 143)";

  const unsubcribe = textBoxesStore.subscribe(
    (value: { [key: string]: TextBoxType }) => {
      textBoxes = value;
    },
  );

  const unsubcribe2 = event_state_store.subscribe((value) => {
    event_state = value;
  });

  const unsubscribe3 = theme_store.subscribe((value) => {
    mode = value;
  });

  $: {
    switch (event_state) {
      case "createTextBox":
        cursor = "text";
        break;
      case "typing":
        cursor = "test";
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
    if (event_state === "typing") return;
    deleteTextBox(selected);
  }

  function handleKeyup(e: KeyboardEvent) {
    if (event_state === "typing") return;
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
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("keyup", handleKeyup);
    canvas?.addEventListener("click", handleClick);
  });

  onDestroy(() => {
    unsubcribe();
    unsubcribe2();
    unsubscribe3();

    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    window.removeEventListener("resize", resizeCanvas);
    window.removeEventListener("keyup", handleKeyup);
    canvas?.removeEventListener("click", handleClick);
  });

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function redrawCanvas() {
    ctx.clearRect(0, 0, canvas?.width, canvas?.height);
    paths.forEach((path: any) => {
      const canvasPath = new Path2D(path);
      ctx.fillStyle = mode === "light" ? "black" : "rgb(143, 143, 143)";
      ctx.fill(canvasPath);
    });
  }

  function handleClear() {
    paths = [];
    points = [];
    moves = [];
    textBoxes = {};
    ctx.clearRect(0, 0, canvas?.width, canvas?.height);
    clearAllTextBoxes();
  }

  function handleUndo() {
    if (moves.length === 0) return;

    const lastMove = moves[moves.length - 1];
    const amount = lastMove.end - lastMove.start;
    const index = lastMove.start;

    paths.splice(index - 1, amount + 2);
    paths = paths;
    moves.splice(moves.length - 1, 1);
    moves = moves;
    redrawCanvas();
  }

  function handlePointerDown(e: PointerEvent) {
    if (event_state === "drawing") {
      start = paths.length + 1;

      if (e.target instanceof HTMLElement) {
        e.target.setPointerCapture(e.pointerId);
      }

      points = [[e.clientX - 3, e.clientY - 3, e.pressure]];
    }
    if (event_state === "rectangle-draw") {
      //start pos of rectangle
      xStart = e.clientX;
      yStart = e.clientY;
    }
  }

  function handlePointerUp() {
    end = paths.length - 1;
    if (end >= start) {
      moves = [...moves, { start, end }];
    }
    if (event_state === "rectangle-draw") {
      //finish the rectangle drawing
    }
  }

  function handlePointerMove(e: PointerEvent) {
    if (e.buttons !== 1) return;
    if (event_state === "drawing") {
      points = [...points, [e.clientX - 3, e.clientY - 3, e.pressure]];
      const stroke = getStroke(points, {
        size: size,
        thinning: 0.6,
        smoothing: 1,
        streamline: 0.0,
      });
      pathData = getSvgPathFromStroke(stroke);
      paths = [...paths, pathData];

      const canvasPath = new Path2D(pathData);
      ctx.fillStyle = mode === "light" ? "black" : "rgb(143, 143, 143)";
      ctx.fill(canvasPath);
    }
    if (event_state === "rectangle-draw") {
      const borderRadius = 10;
      const xCurrent = e.clientX - canvas.offsetLeft;
      const yCurrent = e.clientY - canvas.offsetTop;

      let width = xCurrent - xStart;
      let height = yCurrent - yStart;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let x = width < 0 ? xStart + width : xStart;
      let y = height < 0 ? yStart + height : yStart;

      width = Math.abs(width);
      height = Math.abs(height);

      let adjustedRadius = Math.min(borderRadius, width / 2, height / 2);

      ctx.beginPath();
      ctx.moveTo(x + adjustedRadius, y);
      ctx.lineTo(x + width - adjustedRadius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + adjustedRadius);
      ctx.lineTo(x + width, y + height - adjustedRadius);
      ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - adjustedRadius,
        y + height,
      );
      ctx.lineTo(x + adjustedRadius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - adjustedRadius);
      ctx.lineTo(x, y + adjustedRadius);
      ctx.quadraticCurveTo(x, y, x + adjustedRadius, y);
      ctx.closePath();
      ctx.stroke();
      rectData = {
        x: x,
        y: y,
        width: width,
        height: height,
        borderRadius: adjustedRadius,
        color: fillColor,
        fill: "transparent",
      };
    }
  }

  function handleDark() {
    if (mode === "light") {
      theme_store.set("dark");
    } else {
      theme_store.set("light");
    }
    redrawCanvas();
  }

  let timeoutId: number;

  function handleSmootches() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    catSmootch = true;
    timeoutId = setTimeout(() => {
      catSmootch = false;
    }, 2600);
  }

  function handle_textbox_mode() {
    if (event_state === "createTextBox") {
      event_state_store.set("arrow");
    } else {
      event_state_store.set("createTextBox");
    }
  }

  function handle_drawing_mode() {
    if (event_state === "drawing") {
      event_state_store.set("arrow");
    } else {
      event_state_store.set("drawing");
    }
  }

  function handle_new_rectangle() {
    event_state_store.set("rectangle-draw");
  }

  function handle_arrow_mode() {
    event_state_store.set("arrow");
  }

  function handleSelect(e: CustomEvent<string>) {
    if (e.detail) {
      Rectangle;
      const [_, id] = e.detail.split("&");
      selected = id;
    } else {
      selected = null;
    }
  }
</script>

<main>
  <div class="tool-bar">
    <div class="top-row">
      <button on:click={handleUndo}>Undo</button>
      <button on:click={handleClear}>Clear</button>
      <button on:click={handleDark}>
        {mode === "light" ? "Dark" : "Light"}
      </button>
      <button on:click={handleSmootches}>Smooches</button>
    </div>
    <div class="second-row">
      <button
        on:click={handle_arrow_mode}
        style="background-color: {event_state === 'arrow' ? '#9096ff' : ''}"
      >
        <CursorPointer />
      </button>
      <button
        on:click={handle_drawing_mode}
        style="background-color: {event_state === 'drawing' ? '#9096ff' : ''}"
      >
        <Marker />
      </button>
      {#if event_state === "createTextBox" || event_state === "typing"}
        <button
          on:click={handle_textbox_mode}
          style="background-color:  #9096ff"
        >
          <TextIcon />
        </button>
      {:else}
        <button on:click={handle_textbox_mode}>
          <TextIcon />
        </button>
      {/if}

      <button
        on:click={handle_new_rectangle}
        style="background-color: {event_state === 'rectangle-draw'
          ? '#9096ff'
          : ''}"
      >
        <Rectangle />
      </button>
    </div>
  </div>
  <div class="canvas-container">
    {#if catSmootch}
      smooch
      <img src="/smooch.webp" alt="" class="full-size image" />
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
    z-index: 500;
  }

  .tool-bar {
    position: fixed;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
    top: 9px;
    left: 0;
    width: 100%;
    height: 100px;
    z-index: 1000;
    box-sizing: border-box;
    background-color: rgba(0, 0, 0, 0.288);
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
