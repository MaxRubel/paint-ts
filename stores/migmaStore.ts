// @ts-nocheck
import { writable } from "svelte/store";
import { v4 as uuidv4 } from 'uuid';


export const textBoxesStore = writable({})


export function createNewTextBox(e: MouseEvent, boxHeight: number, boxWidth: number) {
  const newKey = uuidv4();
  const newBox = {
    id: newKey,
    text: "",
    x: e.clientX - 166,
    y: e.clientY
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