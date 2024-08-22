import getStroke from "perfect-freehand";
import { getSvgPathFromStroke } from "./getSvgPathFromStroke";
import { get } from "svelte/store";
import { theme_store } from "../stores/eventState";
import { AddUndoItem } from "../stores/undoStore";
import { brush_size_store } from "../stores/brushStore";
import { fetched_single } from "../stores/fetchDataStore";
import { DrawImage } from "../stores/canvasStore";
import { active_color_store } from "../stores/paletteStore";

let points: [number, number, number][] = [];
let paths: { pathData: string, color: string }[] = [];
let ctx: CanvasRenderingContext2D;
let start = 0;
let end = 0;
let isDrawing = false;
let color = ""
let oldRaster: string | null = null

export function InitCtx(context: CanvasRenderingContext2D) {
  ctx = context;
}

export function GetCanvasContext() {
  if (ctx) {
    return ctx
  } else {
    console.error("Canvas was not initialized properly")
  }
}

export function DrawImageFromDataURL(ctx, dataURL) {
  console.log(dataURL)
  return new Promise((resolve: any, reject) => {
    const img = new Image();
    img.onload = function () {
      requestAnimationFrame(() => {
        const canvas = document.getElementById('main-canvas')
        //@ts-ignore
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        console.log('drawing')
        ctx.drawImage(img, 0, 0);
        resolve();
      })
    };
    img.onerror = reject;
    img.src = dataURL;
  });
}

export function SaveOriginalRaster() {
  const canvas = document.getElementById('main-canvas')
  if (canvas) {
    //@ts-ignore
    oldRaster = canvas.toDataURL()
  }
}

export function DrawBrushStroke(
  context: CanvasRenderingContext2D,
  e: PointerEvent,
): void {
  points.push([e.clientX - 6, e.clientY - 6, e.pressure]);
  if (!isDrawing) {
    start = paths.length;
  }
  isDrawing = true;

  const stroke = getStroke(points, {
    size: get(brush_size_store),
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  });
  const pathData = getSvgPathFromStroke(stroke);
  const canvasPath = new Path2D(pathData);
  color = get(active_color_store)
  if (!color) {
    color = get(theme_store) === 'dark' ? 'lightgray' : 'black'
  }
  paths.push({ color, pathData });
  context.fillStyle = color
  context.fill(canvasPath);
}

export function EndBrushStroke() {
  points = [];
  end = paths.length;
  isDrawing = false;
  AddUndoItem({
    action: 'drewBrush',
    data: { start, end, color, oldRaster }
  });
  paths = []
}

export function InsertOldBrushStrokes(oldStrokes: any) {
  const length = oldStrokes.data.pathArray.length
  paths.splice(oldStrokes.data.start, length, ...oldStrokes.data.pathArray)
  ReDrawBrushStrokes()
}

export function ReDrawBrushStrokes() {
  if (ctx) {
    if (get(fetched_single).id) {
      DrawImage()
    }
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    paths.forEach((path: any) => {
      const canvasPath = new Path2D(path.pathData);
      ctx.fillStyle = path.color
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

export function GetVectorPaths() {
  return paths
}