import { textBoxesStore } from "../stores/textBoxStore";
import type { TextBoxType } from "./types/app_types";
import { mousePositions } from "./webRTCNegotiate";
import { DrawOtherPersonsPoints } from "./drawBrushStroke";
import type { DrawSendData, UndoSendData } from "./drawBrushStroke";

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

type pointsArray = [number, number, number][];

function handleJoin(msgJson) {
  //TODO write dis func
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
    const { [msgJson.id]: deletedBox, ...remainingBoxes } = boxes;
    return remainingBoxes;
  });
}

function handleDrawPointsOnCanvas(msgData: DrawSendData) {
  DrawOtherPersonsPoints(msgData)
}

function handleUndoBrushStroke(msgData: UndoSendData) {
  console.log("received undo data", msgData)
  if (msgData.brush.type === "drawing") {
    msgData.brush.type = "erasing"
    msgData.brush.size = msgData.brush.size + (msgData.brush.size * .4)
  } else {
    msgData.brush.type = "drawing"
  }
  DrawOtherPersonsPoints(msgData)
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
    case "points":
      handleDrawPointsOnCanvas(msgJson)
      break;
    case "undobrushstroke":
      handleUndoBrushStroke(msgJson)
  }
}
