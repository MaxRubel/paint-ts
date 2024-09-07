import { selected_store, theme_store } from "../stores/eventState";
import { get } from "svelte/store";
import { textBoxesStore } from "../stores/textBoxStore";
import type { TextBoxType } from "./types/app_types";

interface TextBoxes {
  [id: string]: TextBoxType;
}

let overlayCanvas: HTMLCanvasElement | null = null;
let isDrawing = false;

export function initializeSelectBox(mainCanvas: HTMLCanvasElement): void {
  overlayCanvas = document.createElement("canvas");
  overlayCanvas.style.position = "absolute";
  overlayCanvas.style.left = mainCanvas.offsetLeft + "px";
  overlayCanvas.style.top = mainCanvas.offsetTop + "px";
  overlayCanvas.width = mainCanvas.width;
  overlayCanvas.height = mainCanvas.height;
  overlayCanvas.style.pointerEvents = "none";
  mainCanvas.parentNode?.insertBefore(overlayCanvas, mainCanvas.nextSibling);
}

export function ClearSelectionRect(): void {
  isDrawing = false;
  if (overlayCanvas) {
    const ctx = overlayCanvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }
    removeOverlayCanvas();
  }
}

export function removeOverlayCanvas(): void {
  if (overlayCanvas && overlayCanvas.parentNode) {
    overlayCanvas.parentNode.removeChild(overlayCanvas);
  }
  overlayCanvas = null;
}

export function DrawSelectBox(
  e: PointerEvent,
  xStart: number,
  yStart: number,
): void {
  const borderRadius = 10;
  if (!overlayCanvas) {
    console.error("no canvas initialized");
    return;
  }

  const xCurrent = e.clientX - overlayCanvas.getBoundingClientRect().left;
  const yCurrent = e.clientY - overlayCanvas.getBoundingClientRect().top;


  let width = xCurrent - xStart;
  let height = yCurrent - yStart;

  let color = get(theme_store) === "dark" ? "lightgray" : "black";
  const ctx = overlayCanvas.getContext("2d");
  if (!ctx) {
    console.error("no ctx found");
    return;
  }
  ctx.strokeStyle = color;

  ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

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

  const textBoxes = get(textBoxesStore);

  const textBoxesInside = Object.values(textBoxes).filter((textBox) =>
    isComponentInRectangle(textBox, x, y, width, height),
  );

  selected_store.set([])

  textBoxesInside.forEach((textBox) => {
    const element: HTMLElement | null = document.getElementById(`textbox&${textBox.id}`);
    if (element) {
      selected_store.update(selected => [...selected, element]);
    }
  });
}

function isComponentInRectangle(
  component: TextBoxType,
  rectX: number,
  rectY: number,
  rectWidth: number,
  rectHeight: number,
): boolean {
  return (
    component.x < rectX + rectWidth &&
    component.x + component.width > rectX &&
    component.y < rectY + rectHeight &&
    component.y + component.height > rectY
  );
}
