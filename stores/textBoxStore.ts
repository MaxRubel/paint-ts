// @ts-nocheck
import { writable } from "svelte/store";
import { v4 as uuidv4 } from "uuid";
import { locked_store } from "./eventState";
import { get } from "svelte/store";
import type { TextBoxType } from "../utils/types/app_types";

export interface TextBoxMap {
  [key: string]: TextBoxType;
}

export const textBoxesStore = writable<TextBoxMap>({});

export function createNewTextBox(
  e: MouseEvent,
  boxHeight: number,
  boxWidth: number,
) {
  const newKey: string = uuidv4();
  let x = 0;
  let y = 0;

  if (get(locked_store)) {
    x = Math.round((e.clientX - 133) / 20) * 20;
    y = Math.round((e.clientY - 40) / 20) * 20;
  } else {
    x = e.clientX - 133;
    y = e.clientY - 40;
  }
  const newBox: TextBoxType = {
    id: newKey,
    type: 'textbox',
    text: "",
    x, y,
    height: 80,
    width: 240,
  };

  textBoxesStore.update((boxes) => ({
    ...boxes,
    [newKey]: newBox,
  }));
}

export function updateTextBox(id: string, updates: any) {
  textBoxesStore.update((boxes) => {
    if (boxes[id]) {
      boxes = { ...boxes, [id]: { ...boxes[id], ...updates } };
    }
    return boxes;
  });
}

export function clearAllTextBoxes(): void {
  textBoxesStore.update(() => {
    return {};
  });
}

export function deleteTextBox(id: string) {
  textBoxesStore.update((boxes) => {
    const { [id]: deletedBox, ...remainingBoxes } = boxes;
    return remainingBoxes;
  });
}
