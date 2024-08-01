import { get, writable } from "svelte/store";
import { SplicePaths } from "../utils/drawBrushStroke";
import type { UndoType } from "../utils/types/app_types";
import { deleteTextBox, updateTextBox } from "./textBoxStore";
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
  }
}

function undoBrushStroke(lastAction) {
  const { start, end } = lastAction.data;
  SplicePaths(start, end);
  popLastItem();
}

function undoTyping(lastAction: UndoType) {
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
  popLastItem();
}

function undoDragSingle(lastAction) {
  const { id, x, y } = lastAction.data
  updateTextBox(id, { x, y })
  popLastItem();
}

function popLastItem() {
  undo_store.update(oldItems => {
    if (oldItems.length > 0) {
      return oldItems.slice(0, -1);
    }
    return oldItems;
  });
}