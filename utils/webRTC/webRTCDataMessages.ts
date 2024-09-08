import { textBoxesStore } from "../../stores/textBoxStore";
import type { TextBoxType } from "../types/app_types";
import { mousePositions } from "./webRTCNegotiate";
import {
  DrawOtherPersonsPoints,
  GetPointsMap,
  RebuildCanvasAfterUndo,
  SyncPointsMap,
} from "../drawBrushStroke";
import type { DrawSendData } from "../drawBrushStroke";

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

export type PointsMap = { [key: string]: PointsObject };

export type PointsObject = {
  id: string;
  size: number;
  color: string;
  array: pointsArray;
};

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

let tempArray: pointsArray = [];

function handleDrawPointsOnCanvas(msgData: DrawSendData) {
  DrawOtherPersonsPoints(msgData);
  tempArray.push(...msgData.array);
  const pointsMap = GetPointsMap();
  if (msgData.end) {
    //store the whole stroke in the pointsMap
    pointsMap[msgData.end] = {
      id: msgData.end,
      size: msgData.brush.size,
      color: msgData.brush.color,
      array: msgData.array,
    };
    SyncPointsMap(pointsMap);
    tempArray = [];
    // console.log("yesh");
    // RebuildCanvasAfterUndo(pointsMap);
  }
}

function handleUndoBrushStroke(msgData: { ["publicMoveId"]: string }) {
  const { publicMoveId } = msgData;
  const pointsMap = GetPointsMap();
  delete pointsMap[publicMoveId];
  SyncPointsMap(pointsMap);
  RebuildCanvasAfterUndo(pointsMap);
}

function handleRedoPublicBrush(msgData: PointsObject) {
  const pointsMap = GetPointsMap();
  pointsMap[msgData.id] = msgData;
  SyncPointsMap(pointsMap);
  RebuildCanvasAfterUndo(pointsMap);
}

export function ParseMessage(msg: string) {
  const [msgType, msgData] = msg.split("&*^");
  const msgJson = JSON.parse(msgData);
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
      handleDrawPointsOnCanvas(msgJson);
      break;
    case "undobrushstroke":
      handleUndoBrushStroke(msgJson);
      break;
    case "redopublicbrush":
      handleRedoPublicBrush(msgJson);
      break;
  }
}
