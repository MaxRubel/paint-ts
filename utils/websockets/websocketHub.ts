import { get } from "svelte/store";
import {
  drawing_room_id,
  drawing_room_store,
  i_am_hosting,
  myPublicId,
} from "../../stores/drawingRoomStore";
import { authStore } from "../auth/auth_store";
import { v4 as uuidv4 } from "uuid";
import { alert_store } from "../../stores/alertStore";
import { navigate } from "svelte-routing";
import {
  CreateOffer,
  HandleIceCandidate,
  HandleRemovePeer,
  peerIds,
  ReceiveAnswer,
  ReceiveOffer,
} from "../webRTC/webRTCNegotiate";
import { textBoxesStore } from "../../stores/textBoxStore";
import {
  GetCanvasContext,
  pointsMap,
  ReceiveNewPointsMap,
  SetOgCanvas,
} from "../drawBrushStroke";

type outgoingMessage = {
  type: string;
  to: string;
  from: string;
  room: string;
  data: any;
};

const wsEndpoint = (import.meta as any).env.VITE_WEBSOCKET_API;

let userId = "";
let ws: WebSocket | null;

interface websocketData {
  host: boolean;
  roomId: string;
  clientId: string;
}

export function InitWShandshake() {
  const initialData: websocketData = {
    host: get(i_am_hosting),
    roomId: "",
    clientId: "",
  };

  if (get(authStore).user?.id) {
    userId = get(authStore).user.uid;
    initialData.clientId = userId;
  } else {
    userId = uuidv4();
    initialData.clientId = userId;
  }

  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  const parsedRoomId = url.pathname.split("/").pop() || "";

  drawing_room_id.set(parsedRoomId);

  if (parsedRoomId) {
    initialData.roomId = parsedRoomId;
  } else {
    console.error("error getting room id from the URL");
  }

  const jsonString = JSON.stringify(initialData);
  const encodedData = encodeURIComponent(jsonString);
  const socket = new WebSocket(`${wsEndpoint}?data=${encodedData}`);
  return { socket, userId };
}

function handleBounceBack() {
  alert_store.set("alert:Ooops! This room doesn't exist");
  setTimeout(() => {
    drawing_room_store.set(false);
    drawing_room_id.set("");
    i_am_hosting.set(false);
    navigate("/");
  }, 1500);
}

function addClientIds(array: string[]) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === get(myPublicId)) {
      continue;
    } else {
      peerIds.update((item) => [...item, array[i]]);
    }
  }
}

function startNegotiations() {
  const array = get(peerIds);
  array.forEach((id) => {
    CreateOffer(id);
  });
}

function parseInitialRoomData(msg: any) {
  const { canvasImage, textboxes } = msg.data;
  const newPointsMap = msg.data.pointsMap;
  const dataURL = `data:image/png;base64,${canvasImage}`

  SetOgCanvas(dataURL)

  //set text boxes:
  textBoxesStore.set(textboxes);

  //draw canvas:
  const ctx = GetCanvasContext();
  const img = new Image();
  img.onload = () => {
    requestAnimationFrame(() => {
      ctx?.drawImage(img, 0, 0);
    });
  };
  img.src = dataURL;
  ReceiveNewPointsMap(newPointsMap);
}

function parseMessage(e: any) {
  const { data } = e;
  const parsed = JSON.parse(data);
  if (data.from === myPublicId) {
    console.warn("receiving my own message");
  }
  switch (parsed.type) {
    case "new_client_ids":
      addClientIds(parsed.data.clientIds);
      startNegotiations();
      break;
    case "offer":
      ReceiveOffer(parsed);
      break;
    case "answer":
      ReceiveAnswer(parsed);
      break;
    case "iceCandidate":
      HandleIceCandidate(parsed);
      break;
    case "someoneLeft":
      HandleRemovePeer(parsed);
      break;
    case "bounceBack":
      handleBounceBack();
      break;
    case "initalJoinData":
      parseInitialRoomData(parsed);
      break;
  }
}

export function InitWebsockets(): string {
  const { socket, userId } = InitWShandshake();
  myPublicId.set(userId);
  ws = socket;
  ws.onmessage = (e) => {
    parseMessage(e);
  };
  return userId;
}

export function CloseWebsocket() {
  if (ws) {
    // const msg: outgoingMessage = {
    //   type: "leaving",
    //   to: "",
    //   from: get(myPublicId),
    //   room: get(drawing_room_id),
    //   data: {},
    // };
    // ws.send(JSON.stringify(msg));
    ws.close();
  }
}

export function SendWSMessage(message: outgoingMessage) {
  ws?.send(JSON.stringify(message));
}

export function SendInitialRoomData(id: string) {
  const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
  const dataURL = canvas.toDataURL("image/png");
  const canvasImage = dataURL.split(",")[1];

  const data = {
    textboxes: get(textBoxesStore),
    canvasImage,
    pointsMap,
  };
  const msg: outgoingMessage = {
    type: "initalJoinData",
    to: id,
    from: get(myPublicId),
    room: get(drawing_room_id),
    data,
  };

  ws?.send(JSON.stringify(msg));
}
