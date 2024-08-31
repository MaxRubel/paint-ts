import { textBoxesStore } from "../stores/textBoxStore";
import type { TextBoxType } from "./types/app_types";
import { mousePositions } from "./webRTCNegotiate";
import { DrawOtherPersonsPoints, RebuildCanvasAfterUndo } from "./drawBrushStroke";
import type { DrawSendData } from "./drawBrushStroke";

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

type pointsArray = [number, number, number][]
export type PointsMap = { [key: string]: PointsObject }
export type PointsObject = { id: string, size: number, color: string, array: pointsArray };
let pointsMap: PointsMap = {}

let tempArray: pointsArray = []

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

  tempArray.push(...msgData.array)
  if (msgData.end) {
    pointsMap[msgData.end] = {
      id: msgData.end,
      size: msgData.brush.size,
      color: msgData.brush.color,
      array: tempArray
    }
    console.log(pointsMap)
    tempArray = []
  }
}


function handleUndoBrushStroke(msgData: string) {
  console.log("received undo data", msgData)

  delete pointsMap[msgData]
  RebuildCanvasAfterUndo(pointsMap)
}

export function ParseMessage(msg: string) {
  const [msgType, msgData] = msg.split("&*^");
  const msgJson = JSON.parse(msgData);
  // console.log('received msg: ', msgData)
  switch (msgType) {
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
