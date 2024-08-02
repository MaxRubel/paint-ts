import { get } from "svelte/store";
import { locked_store, selected_store } from "../stores/eventState";
import { textBoxesStore, updateTextBox } from "../stores/textBoxStore";
import { AddUndoItem } from "../stores/undoStore";
import type { UndoType } from "./types/app_types";

// interface UndoItemData {
//   id: string;
//   x: number;
//   y: number;
// }

// interface UndoItem {
//   action: string;
//   data: UndoItemData[];
// }


let startX = 0;
let startY = 0;
let initialPositions: { [key: string]: { x: number, y: number } } = {};


function roundToNearest20(num: number): number {
  return Math.round(num / 20) * 20;
}

let undoItemsArray: any[] = []
let itemsToDelete = 0

export function StartDragMany(
  e: MouseEvent
) {
  startX = e.clientX;
  startY = e.clientY;

  const selectedDivs = get(selected_store);
  const textBoxes = get(textBoxesStore);
  initialPositions = {};

  const undoItem: UndoType = { action: "draggedMultiple", data: [] };
  itemsToDelete = get(selected_store).length - 1
  selectedDivs.forEach((div: HTMLTextAreaElement) => {
    const [_, id] = div.id.split('&');
    initialPositions[id] = { x: textBoxes[id].x, y: textBoxes[id].y };
    undoItem.data.push({id,x: textBoxes[id].x, y: textBoxes[id].y  })
    undoItemsArray.push(undoItem)
  });
}

export function DragMany(e: MouseEvent) {
  const currentX = e.clientX;
  const currentY = e.clientY;

  const deltaX = currentX - startX;
  const deltaY = currentY - startY;

  const selectedDivs = get(selected_store);
  const isLocked = get(locked_store);

  selectedDivs.forEach((div: HTMLTextAreaElement) => {
    const [_, id] = div.id.split('&');
    const initialPos = initialPositions[id];

    let newX: number, newY: number;

    if (isLocked) {
      newX = roundToNearest20(initialPos.x + deltaX);
      newY = roundToNearest20(initialPos.y + deltaY);
    } else {
      newX = initialPos.x + deltaX;
      newY = initialPos.y + deltaY;
    }
    updateTextBox(id, { x: newX, y: newY });
  });
}

export function EndDragMany(){
  const lastitem = undoItemsArray[undoItemsArray.length-1]
  AddUndoItem(lastitem)
}