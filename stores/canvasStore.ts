import { get, writable } from "svelte/store";
import { GetCanvasContext } from "../utils/drawBrushStroke";
import { doodle_info } from "./fetchDataStore";

export const canvas_store = writable({})

export function InitCanvas(canvas) {
  canvas_store.update((preVal) => ({ ...preVal, canvas }))
}

export function DrawImage() {
  const ctx = GetCanvasContext()
  const { canvasImage } = get(doodle_info).data
  const dataURL = "data:image/png;base64," + canvasImage;
  const img = new Image();
  img.onload = function () {
    ctx?.drawImage(img, 0, 0);
  };
  img.src = dataURL;
}