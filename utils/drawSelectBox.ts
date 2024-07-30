import { theme_store } from '../stores/eventState'
import { get } from 'svelte/store';

let overlayCanvas: HTMLCanvasElement | null = null;
let isDrawing = false;
// let startX = 0;
// let startY = 0;

export function initializeSelectBox(mainCanvas: HTMLCanvasElement): void {
  overlayCanvas = document.createElement('canvas');
  overlayCanvas.style.position = 'absolute';
  overlayCanvas.style.left = mainCanvas.offsetLeft + 'px';
  overlayCanvas.style.top = mainCanvas.offsetTop + 'px';
  overlayCanvas.width = mainCanvas.width;
  overlayCanvas.height = mainCanvas.height;
  overlayCanvas.style.pointerEvents = 'none';
  mainCanvas.parentNode?.insertBefore(overlayCanvas, mainCanvas.nextSibling);
}

export function ClearSelectionRect(): void {
  isDrawing = false;
  if (overlayCanvas) {
    const ctx = overlayCanvas.getContext('2d');
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

export function DrawSelectBox(e: PointerEvent, xStart: number, yStart: number): void {
  const borderRadius = 10;
  if (!overlayCanvas) {
    console.error("no canvas initialized")
    return
  }
  const xCurrent = e.clientX - overlayCanvas.offsetLeft;
  const yCurrent = e.clientY - overlayCanvas.offsetTop;

  let width = xCurrent - xStart;
  let height = yCurrent - yStart;

  let color = get(theme_store) === 'dark' ? 'lightgray' : 'black';
  const ctx = overlayCanvas.getContext('2d')
  if (!ctx) {
    console.error('no ctx found')
    return
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
  ctx.quadraticCurveTo(x + width, y + height, x + width - adjustedRadius, y + height);
  ctx.lineTo(x + adjustedRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - adjustedRadius);
  ctx.lineTo(x, y + adjustedRadius);
  ctx.quadraticCurveTo(x, y, x + adjustedRadius, y);
  ctx.closePath();
  ctx.stroke();
}