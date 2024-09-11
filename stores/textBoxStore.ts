// @ts-nocheck
import { writable } from "svelte/store";
import { v4 as uuidv4 } from "uuid";
import { event_state_store, locked_store, selected_store } from "./eventState";
import { get } from "svelte/store";
import type { TextBoxType } from "../utils/types/app_types";
import { AddUndoItem } from "./undoStore";
import { active_color_store } from "./paletteStore";
import { SendToAll } from "../utils/webRTC/webRTCNegotiate";
import { drawing_room_id } from "./drawingRoomStore";

export type TextBoxMap = {
  [key: string]: TextBoxType;
}

export const textBoxesStore = writable<TextBoxMap>({});

export const text_alignment = writable("center");

export const font_family_store = writable("Arial");

export const font_size_store = writable(24);

export function createNewTextBox(
  e: MouseEvent,
  boxHeight: number,
  boxWidth: number,
): string {
  const newKey: string = uuidv4();
  let x = 0;
  let y = 0;

  const canvas = document.getElementById('main-canvas') as HTMLCanvasElement
  if (!canvas) {
    console.error("no canvas found")
    return
  }
  const canvasRect = canvas?.getBoundingClientRect()

  if (get(locked_store)) {
    x = Math.round((e.clientX - canvasRect.left - 133) / 20) * 20;
    y = Math.round((e.clientY - canvasRect.top - 40) / 20) * 20;
  } else {
    x = e.clientX - canvasRect.left - 133;
    y = e.clientY - canvasRect.top - 40;
  }
  const fontColor = get(active_color_store);
  const align = get(text_alignment);
  const newBox: TextBoxType = {
    id: newKey,
    type: "textbox",
    text: "",
    x,
    y,
    fontColor,
    align,
    height: 80,
    width: 240,
    fontFamily: get(font_family_store),
    fontSize: get(font_size_store),
  };

  textBoxesStore.update((boxes) => ({
    ...boxes,
    [newKey]: newBox,
  }));

  event_state_store.set(`typing&${newKey}`);

  if (get(drawing_room_id)) {
    SendToAll(`newtextbox&*^${JSON.stringify(newBox)}`);
  }

  return newKey;
}

export function updateTextBox(id: string, updates: any) {
  if (!get(textBoxesStore)[id]?.id) return
  textBoxesStore.update((boxes) => {
    if (boxes[id]) {
      boxes = { ...boxes, [id]: { ...boxes[id], ...updates } };
    }
    return boxes;
  });
  const dataToSend = { id, updates };
  if (get(drawing_room_id)) {
    SendToAll(`updatetextbox&*^${JSON.stringify(dataToSend)}`);
  }
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

  if (get(drawing_room_id)) {
    SendToAll(`deletetextbox&*^${JSON.stringify({ id })}`);
  }
}

export function UndoDeletedTextBoxes(array) {
  array.forEach((item) => {
    textBoxesStore.update((boxes) => ({
      ...boxes,
      [item.id]: item,
    }));
  });
}

export function ChangeTextFont(value: string) {
  const eventState = get(event_state_store);
  const oldFont = get(font_family_store);
  font_family_store.set(value);

  if (eventState.includes("typing")) {
    const [, id] = eventState.split("&");
    updateTextBox(id, { fontFamily: value });
    font_family_store.set(value);
    AddUndoItem({
      action: "changedFontSingle",
      data: { id, oldFont },
    });
  }
  if (eventState === "selected") {
    const selected = get(selected_store);
    const undoArray = [];
    const textBoxes = get(textBoxesStore);
    selected.forEach((item) => {
      const [, id] = item.id.split("&");
      undoArray.push({ id, fontFamily: textBoxes[id].fontFamily });
      updateTextBox(id, { fontFamily: value });
      font_family_store.set(value);
    });
    AddUndoItem({
      action: "changedManyFonts",
      data: undoArray,
    });
  }
}
