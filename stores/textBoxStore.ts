// @ts-nocheck
import { writable } from "svelte/store";
import { v4 as uuidv4 } from "uuid";
import { event_state_store, locked_store } from "./eventState";
import { get } from "svelte/store";
import type { TextBoxType } from "../utils/types/app_types";
import { color_store } from "./colorStore";

export interface TextBoxMap {
  [key: string]: TextBoxType;
}

export const textBoxesStore = writable<TextBoxMap>({});

export const text_alignment = writable("")

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
  const fontColor = get(color_store)
  const aligGet = get(text_alignment)
  const align = aligGet ? aligGet : 'center'
  const newBox: TextBoxType = {
    id: newKey,
    type: 'textbox',
    text: "",
    x, y, fontColor, align,
    height: 80,
    width: 240,

  };

  textBoxesStore.update((boxes) => ({
    ...boxes,
    [newKey]: newBox,
  }));

  event_state_store.set(`typing${newKey}`)
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

export function UndoDeletedTextBoxes(array) {
  array.forEach((item) => {
    textBoxesStore.update((boxes) => ({
      ...boxes,
      [item.id]: item
    }))
  })
}