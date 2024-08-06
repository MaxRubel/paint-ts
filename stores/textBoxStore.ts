// @ts-nocheck
import { writable } from "svelte/store";
import { v4 as uuidv4 } from "uuid";
import { event_state_store, locked_store, selected_store } from "./eventState";
import { get } from "svelte/store";
import type { TextBoxType } from "../utils/types/app_types";
import { color_store } from "./colorStore";
import { AddUndoItem } from "./undoStore";

export interface TextBoxMap {
  [key: string]: TextBoxType;
}

export const textBoxesStore = writable<TextBoxMap>({});

export const text_alignment = writable("")

export const font_family_store = writable("Arial")

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
    fontFamily: get(font_family_store)
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

export function ChangeTextFont(value: string) {
  const eventState = get(event_state_store)
  const oldFont = get(font_family_store)

  if (eventState.includes("typing")) {
    const [, id] = eventState.split("&")
    updateTextBox(id, { fontFamily: value })
    font_family_store.set(value)
    AddUndoItem({
      action: "changedFontSingle",
      data: { id, oldFont }
    })
  }
  if (eventState === "selected") {
    const selected = get(selected_store)
    const undoArray = []
    const textBoxes = get(textBoxesStore)
    selected.forEach((item) => {
      const [, id] = item.id.split('&')
      undoArray.push({ id, fontFamily: textBoxes[id].fontFamily })
      updateTextBox(id, { fontFamily: value })
      font_family_store.set(value)
    })
    AddUndoItem({
      action: 'changedManyFonts',
      data: undoArray
    })
  }
}