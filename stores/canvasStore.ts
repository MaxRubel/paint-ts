import { get, writable } from "svelte/store";
import { ClearOldPathData, GetCanvasContext } from "../utils/drawBrushStroke";
import { EmptyFetch, fetched_single } from "./fetchDataStore";
import { clearAllTextBoxes } from "./textBoxStore";
import { ClearUndoStore } from "./undoStore";
import { ClearRedoItems } from "./redoStore";

export function DrawImage() {
  const ctx = GetCanvasContext()
  const { canvasImage } = get(fetched_single).data
  const dataURL = "data:image/png;base64," + canvasImage;
  const img = new Image();
  img.onload = function () {
    ctx?.drawImage(img, 0, 0);
  };
  img.src = dataURL;
}

export function ClearEverything(){
  const ctx = GetCanvasContext()
  const canvas: HTMLCanvasElement = document.getElementById('main-canvas') as HTMLCanvasElement;
  ctx?.clearRect(0, 0, canvas?.width, canvas?.height);
  clearAllTextBoxes();
  ClearOldPathData();
  ClearUndoStore();
  ClearRedoItems();
  fetched_single.set(EmptyFetch)
}