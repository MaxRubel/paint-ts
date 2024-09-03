import { get, writable } from "svelte/store";
import {
  drawing_room_id,
  i_am_hosting,
  myPublicId,
} from "../../stores/drawingRoomStore";
import { SendInitialRoomData, SendWSMessage } from "../websockets/websocketHub";
import { textBoxesStore } from "../../stores/textBoxStore";
import { ParseMessage, type mousePos } from "../webRTC/webRTCDataMessages";
import { alert_store } from "../../stores/alertStore";

export type OutgoingMessage = {
  type: string;
  to: string;
  from: string;
  room: string;
  data: any;
};

export const peerConnections = writable<{ [key: string]: RTCPeerConnection }>({});
export const peerStates = writable<{ [key: string]: boolean }>({});
export const peerIds = writable(<string[]>[]);
export const dataChannels = writable<{ [key: string]: RTCDataChannel }>({});
export const mousePositions = writable<{ [key: string]: mousePos }>({});

const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun.l.google.com:5349" },
  { urls: "stun:stun1.l.google.com:3478" },
];

function sendSingleDataMessage(id: string, message: string) {
  const dataChannel = get(dataChannels)[id];
  dataChannel.send(message);
}

export function SendToAll(message: string) {
  for (const channel of Object.values(get(dataChannels))) {
    channel.send(message);
  }
}

//Guest creates offer to host -->
export async function CreateOffer(id: string) {
  const peerConnection = new RTCPeerConnection({ iceServers });
  const dataChannel = peerConnection.createDataChannel(id);

  peerConnections.update((current) => ({ ...current, [id]: peerConnection }));
  peerStates.update((current) => ({ ...current, [id]: false }));
  dataChannels.update((current) => ({ ...current, [id]: dataChannel }));
  mousePositions.update((current) => ({
    ...current,
    [id]: { id, x: 0, y: 0 },
  }));

  const offer = await peerConnection.createOffer();

  await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

  peerConnection.ondatachannel = (event) => {
    const dataChannel = event.channel;

    dataChannel.onopen = () => {
      sendSingleDataMessage(id, "ihavejoined&*^{}");
    };

    dataChannel.onmessage = (messageEvent) => {
      ParseMessage(messageEvent.data);
    };
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      const dataToSend: OutgoingMessage = {
        type: "iceCandidate",
        from: get(myPublicId),
        to: id,
        room: get(drawing_room_id),
        data: event.candidate,
      };
      if (peerConnection.localDescription) {
        SendWSMessage(dataToSend);
      }
    }
  };

  peerConnection.addEventListener("connectionstatechange", (event) => {
    if (peerConnection.connectionState === "connected") {
      peerStates.update((current) => ({ ...current, [id]: true }));
    }
  });

  const dataToSend: OutgoingMessage = {
    type: "offer",
    to: id,
    from: get(myPublicId),
    room: get(drawing_room_id),
    data: offer,
  };

  SendWSMessage(dataToSend);
}

//the host receives offers
export async function ReceiveOffer(incoming: any) {
  const { from, data } = incoming;
  if (from === get(myPublicId)) {
    console.warn("receiving my own offer");
  }

  const peerConnection = new RTCPeerConnection({ iceServers });
  const dataChannel = peerConnection.createDataChannel(from);

  peerConnections.update((current) => ({ ...current, [from]: peerConnection }));
  peerStates.update((current) => ({ ...current, [from]: false }));
  dataChannels.update((current) => ({ ...current, [from]: dataChannel }));
  peerIds.update((current) => [...current, from]);
  mousePositions.update((current) => ({
    ...current,
    [from]: { id: from, x: 0, y: 0 },
  }));

  await peerConnection.setRemoteDescription(data);

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

  peerConnection.ondatachannel = (event) => {
    const dataChannel = event.channel;

    dataChannel.onmessage = (messageEvent) => {
      ParseMessage(messageEvent.data);
    };

    dataChannel.onopen = () => {
      const textboxes = get(textBoxesStore);
      sendSingleDataMessage(from, `userjoined&*^${JSON.stringify(textboxes)}`);
      if (get(i_am_hosting)) {
        SendInitialRoomData(from);
      }
    };

    dataChannel.onclose = () => {
      peerConnection.close();
    };
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      const dataToSend: OutgoingMessage = {
        type: "iceCandidate",
        from: get(myPublicId),
        to: incoming.from,
        room: get(drawing_room_id),
        data: event.candidate,
      };
      if (peerConnection.localDescription) {
        SendWSMessage(dataToSend);
      }
    }
  };

  peerConnection.addEventListener("connectionstatechange", (event) => {
    if (peerConnection.connectionState === "connected") {
      peerStates.update((current) => ({ ...current, [from]: true }));
    }
  });

  const dataToSend: OutgoingMessage = {
    type: "answer",
    to: from,
    from: get(myPublicId),
    room: get(drawing_room_id),
    data: answer,
  };

  SendWSMessage(dataToSend);
}

export async function ReceiveAnswer(incoming: any) {
  const { from, data } = incoming;
  const peers = get(peerConnections);
  await peers[from].setRemoteDescription(new RTCSessionDescription(data));
}

export function HandleRemovePeer(incoming: any) {
  const cliendId = incoming.from;
  const PCs = get(peerConnections);
  const peerSts = get(peerStates);
  const peerIs = get(peerIds);
  const datachans = get(dataChannels);
  const mice = get(mousePositions);

  PCs[cliendId].close();

  delete PCs[cliendId];
  delete peerSts[cliendId];
  delete datachans[cliendId];
  delete mice[cliendId];
  const filtered = peerIs.filter((item) => item !== cliendId);

  peerConnections.set(PCs);
  peerStates.set(peerSts);
  peerIds.set(filtered);
  dataChannels.set(datachans);
  mousePositions.set(mice);

  alert_store.set("alert:Someone left!");
}

export async function HandleIceCandidate(incoming: any) {
  const { from, data } = incoming;
  const peerConnection = get(peerConnections)[from];

  if (peerConnection) {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(data));
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  } else {
    console.warn("Received ICE candidate for unknown peer", from);
  }
}

export function BroadcastToAll(msg: string) {
  const channels = get(dataChannels);

  for (const channel of Object.values(channels)) {
    channel.send(msg);
  }
}

export function GracefulRTCExit() {
  Object.values(get(peerConnections)).forEach((conn) => {
    if (conn) conn.close();
  });
  Object.values(get(dataChannels)).forEach((chan) => {
    if (chan) chan.close();
  });

  dataChannels.set({});
  peerConnections.set({});
  peerStates.set({});
  peerIds.set([]);
  mousePositions.set({});
}
