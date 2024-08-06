import { get, writable } from "svelte/store";
import { SplicePaths } from "../utils/drawBrushStroke";
import type { UndoBrushStroke, UndoDragSingle, UndoExpand, UndoTyping } from "../utils/types/undo_types";
import type { UndoType } from "../utils/types/app_types";
import { deleteTextBox, textBoxesStore, updateTextBox } from "./textBoxStore";
import { event_state_store } from "./eventState";


export const undo_store = writable<UndoType[]>([])

export function ClearUndoStore() {
  undo_store.set([])
}
// Function to add a new Undo Item
export function AddUndoItem(newItem: UndoType) {
  undo_store.update(oldItems => {
    return [...oldItems, newItem];
  });
  const undoStore = get(undo_store)
  if (!undoStore[undoStore.length - 1]) {
    console.error("oopsies, an underfined value was pushed into the undo store")
  }
}

export function HandleUndo() {
  const arr = get(undo_store);
  if (arr.length === 0) {
    return
  }
  const lastAction = arr[arr.length - 1]

  switch (lastAction.action) {
    case "drewBrush":
      undoBrushStroke(lastAction);
      break;
    case "typed":
      undoTyping(lastAction);
      break;
    case "draggedSingle":
      undoDragSingle(lastAction)
      break;
    case "draggedMultiple":
      handleUndoDragMultiple(lastAction)
      break;
    case "expanded":
      undoExpand(lastAction)
      break;
    case "deleted":
      undoDeletedTextBoxes(lastAction)
      break;
    case "textBoxAligned":
      undoTextBoxAlignChange(lastAction)
      break;
    case "changedFontColor":
      undoChangedFontColor(lastAction)
      break;
    case "changedFontSingle":
      undoChangedFont(lastAction)
      break;
    case 'changedManyFonts':
      undoChangedManyFonts(lastAction)
      break;
    case 'changedManyFontColors':
      undoChangedManyFontColors(lastAction)
      break;
  }
  popLastItem();
  // console.log("undo: ", lastAction.action, "undo store Total Now: ", get(undo_store).length)
}

function undoBrushStroke(lastAction: UndoBrushStroke) {
  const { start, end } = lastAction.data;
  SplicePaths(start, end);
}

function undoTyping(lastAction: UndoTyping) {
  const oldState = get(event_state_store)
  const { id, start } = lastAction.data
  if (start) {
    updateTextBox(id, { text: start })
  } else {
    deleteTextBox(id)
  }
  if (oldState.includes("typing")) {
    event_state_store.set("arrow")
  }
}

function undoDragSingle(lastAction: UndoDragSingle) {
  const { id, x, y } = lastAction.data
  updateTextBox(id, { x, y })
}

function handleUndoDragMultiple(lastAction: any) {
  const { data } = lastAction
  data.forEach((move: any) => {
    updateTextBox(move.id, { x: move.x, y: move.y })
  })
}

function undoExpand(lastAction: UndoExpand) {
  const { id, x, y, height, width } = lastAction.data
  updateTextBox(id, { x, y, height, width })
}

function undoDeletedTextBoxes(lastAction: any) {
  const array = lastAction.data
  array.forEach((item: any) => {
    textBoxesStore.update((boxes) => ({
      ...boxes,
      [item.id]: item
    }))
  })
}

function undoTextBoxAlignChange(lastAction) {
  const { id, align } = lastAction.data
  updateTextBox(id, { align })
}

function undoChangedFontColor(lastAction) {
  const { id, oldColor } = lastAction.data
  updateTextBox(id, { fontColor: oldColor })
}

function undoChangedFont(lastAction) {
  const { id, oldFont } = lastAction.data
  updateTextBox(id, { fontFamily: oldFont })
}

function undoChangedManyFonts(lastAction) {
  const undoArray = lastAction.data
  undoArray.forEach((item) => {
    updateTextBox(item.id, { fontFamily: item.fontFamily })
  })
}

function undoChangedManyFontColors(lastAction) {
  const undoArray = lastAction.data
  undoArray.forEach((item) => {
    updateTextBox(item.id, { fontColor: item.fontColor })
  })
}

function popLastItem() {
  undo_store.update(oldItems => {
    if (oldItems.length > 0) {
      return oldItems.slice(0, -1);
    }
    return oldItems;
  });
}