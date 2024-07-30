import getStroke from "perfect-freehand";
import { getSvgPathFromStroke } from "./getSvgPathFromStroke";
import { get } from "svelte/store";
import { theme_store } from "../stores/eventState";

let points: [number, number, number][] = [];
let paths: string[] = [];

export function DrawBrushStroke(
  ctx: CanvasRenderingContext2D,
  size: number,
  e: PointerEvent,
): void {
  points.push([e.clientX - 6, e.clientY - 5, e.pressure]);

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
  ctx.fillStyle = mode === "light" ? "black" : "rgb(143, 143, 143)";
  ctx.fill(canvasPath);
}

export function EndBrushStroke() {
  points = [];
}

export function ReDrawBrushStrokes(ctx: CanvasRenderingContext2D) {
  paths.forEach((path: any) => {
    const canvasPath = new Path2D(path);
    const mode = get(theme_store);
    ctx.fillStyle = mode === "light" ? "black" : "rgb(143, 143, 143)";
    ctx.fill(canvasPath);
  });
}
