<script lang="ts">
  import { onMount } from "svelte";
  import { InitWShandshake } from "../../utils/initDrawingRoomSocket";
  import { drawing_room_id } from "../../stores/drawingRoomStore";
  import { get } from "svelte/store";

  interface outgoingMessage {
    type: string;
    to: string;
    from: string;
    room: string;
    data: any;
  }

  let peerIds: string[] = [];
  let peerConnections: any = {};
  let myPublicId: string;
  let ws: WebSocket;

  function addClientIds(array: string[]) {
    for (let i = 0; i < array.length; i++) {
      if (array[i] === myPublicId) {
        continue;
      } else {
        peerIds.push(array[i]);
        console.log("other person found: ", array[i]);
      }
    }
  }

  async function createOffer(id: string) {
    const peerConnection = new RTCPeerConnection();
    peerConnections[id] = peerConnection;

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    peerConnection.addEventListener("iceconnectionstatechange", (e) => {
      console.log(peerConnection.iceConnectionState);
    });

    const dataToSend: outgoingMessage = {
      type: "offer",
      to: id,
      from: myPublicId,
      room: get(drawing_room_id),
      data: offer,
    };

    ws.send(JSON.stringify(dataToSend));
    console.log(dataToSend);
  }

  async function handleOffer(incoming: any) {
    const { from, data } = incoming;

    const peerConnection = new RTCPeerConnection();
    peerConnections[from] = peerConnection;

    await peerConnection.setRemoteDescription(data);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    const dataToSend: outgoingMessage = {
      type: "answer",
      to: from,
      from: myPublicId,
      room: get(drawing_room_id),
      data: answer,
    };

    ws.send(JSON.stringify(dataToSend));
  }

  function startNegotiations() {
    peerIds.forEach((id) => {
      createOffer(id);
    });
  }

  function parseMessage(e: any) {
    const { data } = e;
    const parsed = JSON.parse(data);
    console.log("received :", parsed.type);
    if (data.to === myPublicId) {
      console.warn("receiving my own message");
    }
    switch (parsed.type) {
      case "new_client_ids":
        addClientIds(parsed.data.clientIds);
        startNegotiations();
        break;
      case "offer":
        console.log("received offer");
        handleOffer(parsed);
      case "answer":
        console.log("received answer baby, ", parsed);
    }
  }

  onMount(() => {
    const { socket, userId } = InitWShandshake();
    myPublicId = userId;
    ws = socket;
    ws.onmessage = (e) => {
      parseMessage(e);
    };
  });
</script>
