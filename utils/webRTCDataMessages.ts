import { get } from "svelte/store";
import { other_peoples_textboxes } from "../stores/drawingRoomStore";
import { textBoxesStore } from "../stores/textBoxStore";
import type { TextBoxType } from "./types/app_types";
import { mousePositions } from "./webRTCNegotiate";

type textboxMsg = {
  [key: string]: TextBoxType;
};

export type mousePos = {
  id: string;
  x: number;
  y: number;
};

type updateTextBox = {
  id: string;
  updates: any;
};

type deleteTextbox = {
  id: string;
};

function handleJoin(msgJson: textboxMsg) {
  other_peoples_textboxes.update((current) => ({ ...current, ...msgJson }));
}

function handleUpdateTextBoxes(msgJson: updateTextBox) {
  textBoxesStore.update((current) => ({
    ...current,
    [msgJson.id]: { ...current[msgJson.id], ...msgJson.updates },
  }));
}

function handleMousePos(msgJson: mousePos) {
  mousePositions.update((current) => ({ ...current, [msgJson.id]: msgJson }));
}

function handleNewTextBox(msgJson: TextBoxType) {
  textBoxesStore.update((current) => ({ ...current, [msgJson.id]: msgJson }));
}

function handleDeleteTextBoxes(msgJson: deleteTextbox) {
  textBoxesStore.update((boxes) => {
    console.log("boxes", boxes);
    console.log(msgJson.id);
    const { [msgJson.id]: deletedBox, ...remainingBoxes } = boxes;
    return remainingBoxes;
  });
}

export function ParseMessage(msg: string) {
  const [msgType, msgData] = msg.split("&*^");
  const msgJson = JSON.parse(msgData);

  switch (msgType) {
    case "userjoined":
      handleJoin(msgJson);
      break;
    case "newtextbox":
      handleNewTextBox(msgJson);
      break;
    case "updatetextbox":
      handleUpdateTextBoxes(msgJson);
      break;
    case "deletetextbox":
      handleDeleteTextBoxes(msgJson);
    case "mousepos":
      handleMousePos(msgJson);
      break;
  }
}
