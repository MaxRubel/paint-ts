import { get, writable } from "svelte/store";
import { drawing_room_id, myPublicId } from "../stores/drawingRoomStore";
import { SendWSMessage } from "./websocketHub";
import { textBoxesStore } from "../stores/textBoxStore";
import { ParseMessage, type mousePos } from "./webRTCDataMessages";

type outgoingMessage = {
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
  console.log("sending message to: ", dataChannel);
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

  const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
  if (!canvas) {
    console.error("error setting up canvas for WebRTC");
    return;
  }
  const stream = canvas.captureStream(30);
  peerConnection.addTrack(stream.getTracks()[0], stream);

  const offerOptions = {
    offerToReceiveAudio: false,
    offerToReceiveVideo: true,
    videoCodecPreference: "VP8",
  };

  const offer = await peerConnection.createOffer(offerOptions);

  await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

  peerConnection.ondatachannel = (event) => {
    const dataChannel = event.channel;

    dataChannel.onopen = () => {
      sendSingleDataMessage(id, "iamreadytojoin&*^{}");
    };

    dataChannel.onmessage = (messageEvent) => {
      ParseMessage(messageEvent.data);
    };
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      const dataToSend: outgoingMessage = {
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

  const dataToSend: outgoingMessage = {
    type: "offer",
    to: id,
    from: get(myPublicId),
    room: get(drawing_room_id),
    data: offer,
  };
  //herehere
  peerConnection.ontrack = (e) => {
    if (e.track.kind === "video") {
      const videoElem = document.getElementById(
        `video-element-${id}`,
      ) as HTMLVideoElement;
      if (!videoElem) {
        console.warn("video not found");
        return;
      }
      videoElem.style.backgroundColor = "transparent";
      videoElem.style.objectFit = "contain";
      videoElem.playsInline = true;
      videoElem.srcObject = e.streams[0];
      videoElem.play().catch((e) => console.error("Error playing video:", e));
      console.log("got stream", e.streams[0]);
      // videoElem.addEventListener("play", () => {
      //   VideoToCanvas(id, videoElem);
      // });
    }
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

  const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
  if (!canvas) {
    console.error("error setting up canvas for WebRTC");
    return;
  }
  const stream = canvas.captureStream(30);

  peerConnection.addTrack(stream.getTracks()[0], stream);

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
    };

    dataChannel.onclose = () => {
      console.log("Data channel has closed");
    };
  };
  //herehere
  peerConnection.ontrack = (e) => {
    if (e.track.kind === "video") {
      const videoElem = document.getElementById(
        `video-element-${from}`,
      ) as HTMLVideoElement;
      if (!videoElem) {
        console.warn("video not found");
        return;
      }
      videoElem.style.backgroundColor = "transparent";
      videoElem.style.mixBlendMode = "source-over";
      videoElem.style.objectFit = "contain";
      videoElem.playsInline = true;
      videoElem.srcObject = e.streams[0];
      videoElem.play().catch((e) => console.error("Error playing video:", e));
      console.log("got stream", e.streams[0]);
      // videoElem.addEventListener("play", () => {
      //   VideoToCanvas(from, videoElem);
      // });
    }
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      const dataToSend: outgoingMessage = {
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

  const dataToSend: outgoingMessage = {
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

  PCs[cliendId].close();
  delete PCs[cliendId];
  delete peerSts[cliendId];

  const filtered = peerIs.filter((item) => item !== cliendId);

  peerConnections.set(PCs);
  peerStates.set(peerSts);
  peerIds.set(filtered);
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
