import { get } from "svelte/store";
import { drawing_room_id, i_am_hosting } from "../stores/drawingRoomStore";
import { authStore } from "../utils/auth/auth_store";
import { uuidv4 } from "@firebase/util";

const wsEndpoint = (import.meta as any).env.VITE_WEBSOCKET_API;

let userId = "";

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
