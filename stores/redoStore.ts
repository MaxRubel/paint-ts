import { get, writable } from "svelte/store";
import { DrawImageFromDataURL, GetCanvasContext } from "../utils/drawBrushStroke";
import { AddUndoItem } from "./undoStore";
import { deleteTextBox, textBoxesStore, updateTextBox } from "./textBoxStore";
import type { TextBoxType, UndoType } from "../utils/types/app_types";

interface RedoItem {
  action: string;
  data: any;
  undoItem: UndoType;
}

export const redo_store = writable<RedoItem[]>([]);

export function AddRedoItem(redoItem: any) {
  redo_store.update((oldItems) => {
    return [...oldItems, redoItem];
  });
}

export function ClearRedoItems() {
  redo_store.set([]);
}

export function HandleRedo() {
  const redoArray = get(redo_store);
  if (redoArray.length === 0) return;
  const redoItem: RedoItem = redoArray[redoArray.length - 1];

  switch (redoItem.action) {
    case "drawBushStroke":
      redoDrawBrushStrokes(redoItem);
      break;
    case "createTextBox":
      createOldTextBox(redoItem);
      break;
    case "addOldTyped":
      addOldText(redoItem);
      break;
    case "redoDrag":
      redoDrag(redoItem);
      break;
    case "redoDragMultiple":
      redoDragMultiple(redoItem);
      break;
    case "redoExpand":
      redoExpand(redoItem);
      break;
    case "redoDelete":
      redoDelete(redoItem);
      break;
    case "redoSingleAlignChange":
      redoSingleAlignChange(redoItem);
      break;
    case "redoFontChangeColor":
      redoFontChangeColor(redoItem);
      break;
    case "redoChangedFontSingle":
      redoChangedFontSingle(redoItem);
      break;
  }
  if (
    redoItem.action === "redoManyFontChanges" ||
    redoItem.action === "redoChangedManyFontColors" ||
    redoItem.action === "redoChangeFontSizes" ||
    redoItem.action === "redoManyTextBoxAligned"
  ) {
    resetManyTextBoxes(redoItem);
  }
  AddUndoItem(redoItem.undoItem);
  popLastItem();
}

function redoDrawBrushStrokes(lastAction: RedoItem) {
  const ctx = GetCanvasContext();
  if (!ctx) {
    console.error("error redrawing brush strokes onto uninit canvas context");
    return;
  }
  DrawImageFromDataURL(ctx, lastAction.data.currentRaster);
}

function createOldTextBox(undoItem: any) {
  updateTextBox(undoItem.data.id, undoItem.data);
}

function addOldText(undoItem: any) {
  updateTextBox(undoItem.data.id, undoItem.data);
  textBoxesStore.update((prevVal) => ({
    ...prevVal,
    [undoItem.data.id]: undoItem.data,
  }));
}

function redoDrag(undoItem: any) {
  updateTextBox(undoItem.data.id, undoItem.data);
}

function redoDragMultiple(redoItem: any) {
  redoItem.data.forEach((textbox: TextBoxType) => {
    updateTextBox(textbox.id, textbox);
  });
}

function redoExpand(redoItem: any) {
  const { data } = redoItem;
  updateTextBox(data.id, data);
}

function redoDelete(redoItem: any) {
  const { data } = redoItem.undoItem;
  data.forEach((textbox: TextBoxType) => {
    deleteTextBox(textbox.id);
  });
  //this one!
}

function redoSingleAlignChange(redoItem: any) {
  const { data } = redoItem;
  updateTextBox(data.id, data);
}

function redoFontChangeColor(redoItem: any) {
  const { data } = redoItem;
  updateTextBox(data.id, data);
}

function redoChangedFontSingle(redoItem: any) {
  const { data } = redoItem;
  updateTextBox(data.id, data);
}

function resetManyTextBoxes(redoItem: any) {
  const { data } = redoItem;
  data.forEach((textbox: TextBoxType) => {
    updateTextBox(textbox.id, textbox);
  });
}

function popLastItem() {
  redo_store.update((oldItems) => {
    if (oldItems.length > 0) {
      return oldItems.slice(0, -1);
    }
    return oldItems;
  });
}
