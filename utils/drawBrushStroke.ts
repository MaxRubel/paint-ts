import getStroke from "perfect-freehand";
import { getSvgPathFromStroke } from "./getSvgPathFromStroke";
import { get } from "svelte/store";
import { event_state_store, theme_store } from "../stores/eventState";
import { AddUndoItem } from "../stores/undoStore";
import { brush_size_store } from "../stores/brushStore";
import { fetched_single } from "../stores/fetchDataStore";
import { DrawImage } from "../stores/canvasStore";
import { active_color_store } from "../stores/paletteStore";

let points: [number, number, number][] = [];
let paths: { pathData: string; color: string }[] = [];
let ctx: CanvasRenderingContext2D;
let start = 0;
let end = 0;
let isDrawing = false;
let color = "";

//Temporary store of canvas as DataURL on mouse down of eraser/drawing
let oldRaster: string | null = null;

//Store of canvas as DataURL on mouse up
let currentCanvas: string = "";

export function InitCtx(context: CanvasRenderingContext2D) {
  ctx = context;
}

export function GetCanvasContext() {
  if (ctx) {
    return ctx;
  } else {
    console.error("Canvas was not initialized properly");
  }
}

export function DrawImageFromDataURL(
  ctx: CanvasRenderingContext2D,
  dataURL: string,
) {
  return new Promise((resolve: any, reject) => {
    const img = new Image();

    img.onload = function () {
      requestAnimationFrame(() => {
        const canvas = document.getElementById("main-canvas");
        if (!canvas) {
          reject(new Error("Canvas element not found"));
          return;
        }

        //@ts-ignore
        canvas.width = img.width;
        //@ts-ignore
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);
        resolve();
      });
    };

    img.onerror = (error) => {
      console.error("Error loading image:", error);
      reject(error);
    };

    img.src = dataURL;
  });
}

export function SaveOriginalRaster() {
  if (!ctx) {
    console.error("Canvas context not initialized");
    return;
  }

  const canvas = document.getElementById("main-canvas");
  if (!canvas) {
    console.error("no canvas found");
    return;
  }

  //@ts-ignore
  oldRaster = canvas.toDataURL("image/png");
}

export function DrawBrushStroke(
  context: CanvasRenderingContext2D,
  e: PointerEvent,
): void {
  const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();

  // Calculate the scaling factors
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  // Adjust the coordinates based on the scaling factors
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  points.push([x, y, e.pressure]);

  if (!isDrawing) {
    start = paths.length;
  }

  isDrawing = true;
  const eventState = get(event_state_store);

  if (eventState === "drawing") {
    ctx.globalCompositeOperation = "source-over";
  } else if (eventState === "erasing") {
    ctx.globalCompositeOperation = "destination-out";
  }
  const stroke = getStroke(points, {
    size: get(brush_size_store),
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  });
  const pathData = getSvgPathFromStroke(stroke);
  const canvasPath = new Path2D(pathData);
  color = get(active_color_store);
  if (!color) {
    color = get(theme_store) === "dark" ? "lightgray" : "black";
  }
  paths.push({ color, pathData });
  context.fillStyle = color;
  context.fill(canvasPath);
}

export function EndBrushStroke() {
  points = [];
  end = paths.length;
  isDrawing = false;
  const canvas = document.getElementById("main-canvas");
  const eventState = get(event_state_store);
  if (canvas) {
    //@ts-ignore
    currentCanvas = canvas.toDataURL();
  }
  // openImageInNewWindow(oldRaster)
  if (eventState === "drawing") {
    AddUndoItem({
      action: "drewBrush",
      data: { start, end, color, oldRaster },
    });
  } else if (eventState === "erasing") {
    AddUndoItem({
      action: "erased",
      data: { oldRaster },
    });
  }
  oldRaster = null;
  paths = [];
}

export function GetCurrentCanvas() {
  return currentCanvas;
}

export function ClearCurrentCanvas() {
  currentCanvas = "";
}

export function ClearOldPathData() {
  paths = [];
}

export function GetVectorPaths() {
  return paths;
}
