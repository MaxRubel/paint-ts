import { get, writable } from "svelte/store";
import { ClearCurrentCanvas, ClearOldPathData, GetCanvasContext, GetCurrentCanvas } from "../utils/drawBrushStroke";
import { EmptyFetch, fetched_single } from "./fetchDataStore";
import { clearAllTextBoxes } from "./textBoxStore";
import { ClearUndoStore } from "./undoStore";
import { ClearRedoItems } from "./redoStore";

export function DrawImage() {
  const ctx = GetCanvasContext()
  const canvas = document.getElementById('main-canvas')
  if (!canvas) {
    console.error('no canvas found')
    return
  }

  const fetchedData = get(fetched_single)

  let fetchedImage

  if (fetchedData.id) {
    fetchedImage = get(fetched_single).data.canvasImage
  }

  //get the latest updates:
  const currentCanvas = GetCurrentCanvas()
  let dataURL

  if (currentCanvas) {
    dataURL = currentCanvas;
  } else if (fetchedImage) {
    //not updated yet, but still working from original drawing
    dataURL = "data:image/png;base64," + fetchedImage;
  }
  //if empty no need to draw anything
  const img = new Image();
  img.onload = function () {
    requestAnimationFrame(() => {
      ctx?.drawImage(img, 0, 0);
    })
  };
  //@ts-ignore
  img.src = dataURL;

}

export function ClearEverything() {
  const ctx = GetCanvasContext()
  const canvas: HTMLCanvasElement = document.getElementById('main-canvas') as HTMLCanvasElement;
  ctx?.clearRect(0, 0, canvas?.width, canvas?.height);
  clearAllTextBoxes();
  ClearOldPathData();
  ClearUndoStore();
  ClearRedoItems();
  ClearCurrentCanvas();
  fetched_single.set(EmptyFetch)
}