import { other_peoples_textboxes } from "../stores/drawingRoomStore";
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

function handleJoin(msgData: textboxMsg) {
  console.log("joining now");
  other_peoples_textboxes.update((current) => ({ ...current, ...msgData }));
}

function handleUpdateTextBoxes(msgData: textboxMsg) {
  console.log("receiving new test boxes", msgData);
  other_peoples_textboxes.update((current) => ({ ...current, ...msgData }));
}

function handleMousePos(msgData: mousePos) {
  console.log(msgData);
  mousePositions.update((current) => ({ ...current, [msgData.id]: msgData }));
}

export function ParseMessage(msg: string) {
  const [msgType, msgData] = msg.split("&*^");
  const msgJson = JSON.parse(msgData);

  switch (msgType) {
    case "userjoined":
      handleJoin(msgJson);
      break;
    case "changingTextbox":
      handleUpdateTextBoxes(msgJson);
      break;
    case "mousepos":
      handleMousePos(msgJson);
  }
}
