import getStroke from "perfect-freehand";
import { getSvgPathFromStroke } from "./getSvgPathFromStroke";
import { get } from "svelte/store";
import { theme_store } from "../stores/eventState";
import { AddUndoItem } from "../stores/undoStore";

let points: [number, number, number][] = [];
let paths: string[] = [];
let ctx: CanvasRenderingContext2D;
let start = 0;
let end = 0;
let isDrawing = false;

export function InitCtx(context: CanvasRenderingContext2D) {
  ctx = context;
}

export function DrawBrushStroke(
  context: CanvasRenderingContext2D,
  size: number,
  e: PointerEvent,
): void {
  points.push([e.clientX - 6, e.clientY - 5, e.pressure]);
  if (!isDrawing) {
    start = paths.length;
  }
  isDrawing = true;

  const stroke = getStroke(points, {
    size: size,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  });

  const pathData = getSvgPathFromStroke(stroke);
  paths.push(pathData);

  const canvasPath = new Path2D(pathData);
  const mode = get(theme_store);
  context.fillStyle = mode === "light" ? "black" : "rgb(143, 143, 143)";
  context.fill(canvasPath);
}

export function EndBrushStroke() {
  points = [];
  end = paths.length;
  isDrawing = false;
  AddUndoItem({
    action: 'drewBrush',
    data: { start, end }
  });
}

export function ReDrawBrushStrokes() {
  if (ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    paths.forEach((path: string) => {
      const canvasPath = new Path2D(path);
      const mode = get(theme_store);
      ctx.fillStyle = mode === "light" ? "black" : "rgb(143, 143, 143)";
      ctx.fill(canvasPath);
    });
  } else {
    console.error("Canvas context is not initialized");
  }
}

export function ClearOldPathData() {
  paths = [];
}

export function SplicePaths(start: number, amount: number) {
  paths.splice(start, amount);
  ReDrawBrushStrokes();
}