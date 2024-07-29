// @ts-nocheck
import { writable } from "svelte/store";
import { v4 as uuidv4 } from 'uuid';
import { locked_store } from "./eventState";
import { get } from "svelte/store";


export const textBoxesStore = writable({})


export function createNewTextBox(e: MouseEvent, boxHeight: number, boxWidth: number) {
  const newKey = uuidv4();
  let x = 0
  let y = 0

  if (get(locked_store)) {
    x = Math.round((e.clientX - 166) / 20) * 20;
    y = Math.round((e.clientY - 50) / 20) * 20;
  } else {
    x = e.clientX - 166
    y = e.clientY
  }
  const newBox = {
    id: newKey,
    text: "",
    x, y
  };

  textBoxesStore.update(boxes => ({
    ...boxes,
    [newKey]: newBox
  }));
}

export function updateTextBox(id, updates) {
  textBoxesStore.update(boxes => {
    if (boxes[id]) {
      boxes[id] = { ...boxes[id], ...updates };
    }
    return boxes;
  });
}

export function clearAllTextBoxes() {
  textBoxesStore.update(() => {
    return {}
  })
}

export function deleteTextBox(id) {
  textBoxesStore.update(boxes => {
    const { [id]: deletedBox, ...remainingBoxes } = boxes;
    return remainingBoxes;
  });
}