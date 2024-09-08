import { get, writable } from "svelte/store";
import {
  DrawImageFromDataURL,
  GetCanvasContext,
  GetPointsMap,
  RebuildCanvasAfterUndo,
  SyncPointsMap,
} from "../utils/drawBrushStroke";
import type {
  UndoBrushStroke,
  UndoDragSingle,
  UndoExpand,
  UndoTyping,
} from "../utils/types/undo_types";
import type { TextBoxType, UndoType } from "../utils/types/app_types";
import {
  deleteTextBox,
  font_size_store,
  textBoxesStore,
  updateTextBox,
} from "./textBoxStore";
import { event_state_store } from "./eventState";
import { AddRedoItem, redo_store } from "../stores/redoStore";
import { SendToAll } from "../utils/webRTC/webRTCNegotiate";

export const undo_store = writable<UndoType[]>([]);

export function ClearUndoStore() {
  undo_store.set([]);
}

export function AddUndoItem(newItem: UndoType, fromRedo = false) {
  if (!fromRedo) {
    redo_store.set([]);
  }
  undo_store.update((oldItems) => {
    return [...oldItems, newItem];
  });
  const undoStore = get(undo_store);
  if (!undoStore[undoStore.length - 1]) {
    console.error("oopsies, an underfined value was pushed into the undo store");
  }
}

export function HandleUndo() {
  const arr = get(undo_store);
  if (arr.length === 0) {
    return;
  }
  const lastAction = arr[arr.length - 1];

  switch (lastAction.action) {
    case "drewBrush":
      undoBrushStroke(lastAction);
      break;
    case "erased":
      undoEraser(lastAction);
      break;
    case "created_text_box":
      undoCreatedTextBox(lastAction);
      break;
    case "typed":
      undoTyping(lastAction);
      break;
    case "draggedSingle":
      undoDragSingle(lastAction);
      break;
    case "draggedMultiple":
      handleUndoDragMultiple(lastAction);
      break;
    case "expanded":
      undoExpand(lastAction);
      break;
    case "deleted":
      undoDeletedTextBoxes(lastAction);
      break;
    case "textBoxAligned":
      undoTextBoxAlignChange(lastAction);
      break;
    case "changedFontColor":
      undoChangedFontColor(lastAction);
      break;
    case "changedFontSingle":
      undoChangedFont(lastAction);
      break;
    case "changedManyFonts":
      undoChangedManyFonts(lastAction);
      break;
    case "changedManyFontColors":
      undoChangedManyFontColors(lastAction);
      break;
    case "changedFontSizes":
      undoChangedFontSizes(lastAction);
      break;
    case "manyTextBoxAligned":
      undoManyTextBoxAligned(lastAction);
      break;
    case "drewBrushPublic":
      undoBrushPublic(lastAction);
      break;
  }
  popLastItem();
}

function undoBrushStroke(lastAction: UndoBrushStroke) {
  const { start, end, oldRaster } = lastAction.data;

  const ctx = GetCanvasContext();
  if (!ctx) {
    console.error("no context found error undoing brush stroke");
    return;
  }
  DrawImageFromDataURL(oldRaster).then(() => {
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    if (!canvas) {
      console.error("oopsies-no canvas");
      return;
    }
    const currentRaster = canvas.toDataURL();

    AddRedoItem({
      action: "drawBushStroke",
      data: {
        currentRaster,
        start,
        end,
      },
      undoItem: lastAction,
    });
  });
}

export function undoEraser(lastAction: any) {
  const ctx = GetCanvasContext();
  if (!ctx) {
    console.error("Canvas context not available");
    return;
  }

  const { oldRaster } = lastAction.data;
  DrawImageFromDataURL(oldRaster);

  const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
  if (!ctx) {
    console.error("Canvas context not available");
    return;
  }
  const currentRaster = canvas.toDataURL();

  AddRedoItem({
    action: "drawBushStroke",
    data: { currentRaster },
    undoItem: lastAction,
  });
}

function undoCreatedTextBox(lastAction: any) {
  const textBoxID = lastAction.data;
  AddRedoItem({
    action: "createTextBox",
    data: get(textBoxesStore)[textBoxID],
    undoItem: lastAction,
  });
  deleteTextBox(textBoxID);
}

function undoTyping(lastAction: UndoTyping) {
  const oldState = get(event_state_store);
  const { id, start } = lastAction.data;

  AddRedoItem({
    action: "addOldTyped",
    data: get(textBoxesStore)[id],
    undoItem: lastAction,
  });

  updateTextBox(id, { text: start });

  if (oldState.includes("typing")) {
    event_state_store.set("arrow");
  }
}

function undoDragSingle(lastAction: UndoDragSingle) {
  const { id, x, y } = lastAction.data;

  AddRedoItem({
    action: "redoDrag",
    data: get(textBoxesStore)[id],
    undoItem: lastAction,
  });

  updateTextBox(id, { x, y });
}

function handleUndoDragMultiple(lastAction: any) {
  const { data } = lastAction;
  const dataArray: TextBoxType[] = [];

  data.forEach((textbox: TextBoxType) => {
    const fetched = get(textBoxesStore)[textbox.id];
    dataArray.push(fetched);
  });

  AddRedoItem({
    action: "redoDragMultiple",
    data: dataArray,
    undoItem: lastAction,
  });

  data.forEach((move: any) => {
    updateTextBox(move.id, { x: move.x, y: move.y });
  });
}

function undoExpand(lastAction: UndoExpand) {
  const { id, x, y, height, width } = lastAction.data;

  AddRedoItem({
    action: "redoExpand",
    data: get(textBoxesStore)[id],
    undoItem: lastAction,
  });

  updateTextBox(id, { x, y, height, width });
}

function undoDeletedTextBoxes(lastAction: any) {
  const array = lastAction.data;

  AddRedoItem({
    action: "redoDelete",
    data: "",
    undoItem: lastAction,
  });

  array.forEach((item: any) => {
    textBoxesStore.update((boxes) => ({
      ...boxes,
      [item.id]: item,
    }));
  });
}

function undoTextBoxAlignChange(lastAction: any) {
  const { id, align } = lastAction.data;

  AddRedoItem({
    action: "redoSingleAlignChange",
    data: get(textBoxesStore)[id],
    undoItem: lastAction,
  });

  updateTextBox(id, { align });
}

function undoChangedFontColor(lastAction: any) {
  const { id, oldColor } = lastAction.data;

  AddRedoItem({
    action: "redoFontChangeColor",
    data: get(textBoxesStore)[id],
    undoItem: lastAction,
  });

  updateTextBox(id, { fontColor: oldColor });
}

function undoChangedFont(lastAction: any) {
  const { id, oldFont } = lastAction.data;

  AddRedoItem({
    action: "redoChangedFontSingle",
    data: get(textBoxesStore)[id],
    undoItem: lastAction,
  });

  updateTextBox(id, { fontFamily: oldFont });
}

function undoChangedManyFonts(lastAction: any) {
  const undoArray = lastAction.data;

  packageMultipleRedos("redoManyFontChanges", lastAction);

  undoArray.forEach((item: any) => {
    updateTextBox(item.id, { fontFamily: item.fontFamily });
  });
}

function undoChangedManyFontColors(lastAction: any) {
  const undoArray = lastAction.data;

  packageMultipleRedos("redoChangedManyFontColors", lastAction);

  undoArray.forEach((item: any) => {
    updateTextBox(item.id, { fontColor: item.fontColor });
  });
}

function undoChangedFontSizes(lastAction: any) {
  const undoArray = lastAction.data;

  packageMultipleRedos("redoChangeFontSizes", lastAction);

  undoArray.forEach((item: any) => {
    updateTextBox(item.id, { fontSize: item.oldFontSize });
    font_size_store.set(item.oldFontSize);
  });
}

function undoManyTextBoxAligned(lastAction: any) {
  const undoArray = lastAction.data;

  packageMultipleRedos("redoManyTextBoxAligned", lastAction);

  undoArray.forEach((item: any) => {
    updateTextBox(item.id, { align: item.align });
  });
}

function packageMultipleRedos(action: string, undoItem: any) {
  const undoArray = undoItem.data;
  const data: any[] = [];

  undoArray.forEach((textBox: TextBoxType) => {
    data.push(get(textBoxesStore)[textBox.id]);
  });

  AddRedoItem({ action, data, undoItem });
}

function undoBrushPublic(lastAction: any) {
  const pointsMap = GetPointsMap();

  const { publicMoveId } = lastAction.data;

  const item = pointsMap[publicMoveId];

  AddRedoItem({
    action: "undidpublicbrushstroke",
    data: item,
    undoItem: lastAction,
  });

  delete pointsMap[publicMoveId];

  RebuildCanvasAfterUndo(pointsMap);
  SyncPointsMap(pointsMap);
  SendToAll(`undobrushstroke&*^${JSON.stringify({ publicMoveId })}`);
}

function popLastItem() {
  undo_store.update((oldItems) => {
    if (oldItems.length > 0) {
      return oldItems.slice(0, -1);
    }
    return oldItems;
  });
}
