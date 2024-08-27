<script lang="ts">
  import { onMount } from "svelte";
  import { InitWShandshake } from "../../utils/initDrawingRoomSocket";
  import { drawing_room_id } from "../../stores/drawingRoomStore";
  import { get } from "svelte/store";

  const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun.l.google.com:5349" },
    { urls: "stun:stun1.l.google.com:3478" },
  ];

  interface outgoingMessage {
    type: string;
    to: string;
    from: string;
    room: string;
    data: any;
  }

  let peerIds: string[] = [];
  let peerConnections: { [key: string]: RTCPeerConnection } = {};
  let myPublicId: string;
  let ws: WebSocket;
  let iceCandidateQueue: RTCIceCandidate[] = [];

  function addClientIds(array: string[]) {
    for (let i = 0; i < array.length; i++) {
      if (array[i] === myPublicId) {
        continue;
      } else {
        peerIds.push(array[i]);
        peerIds = peerIds;
      }
    }
  }
  async function handleIceCandidate(incoming: any) {
    const { from, data } = incoming;
    console.log("Received ICE candidate", data);
    const peerConnection = peerConnections[from];

    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data));
        console.log("Added ICE candidate successfully");
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    } else {
      console.warn("Received ICE candidate for unknown peer", from);
    }
  }

  async function createOffer(id: string) {
    const peerConnection = new RTCPeerConnection({ iceServers });
    peerConnections[id] = peerConnection;
    const dataChannel = peerConnection.createDataChannel(id);

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

    peerConnection.onicecandidate = (event) => {
      console.log("ice candidate");
      if (event.candidate) {
        const dataToSend: outgoingMessage = {
          type: "iceCandidate",
          from: myPublicId,
          to: id,
          room: get(drawing_room_id),
          data: event.candidate,
        };
        if (peerConnection.localDescription) {
          ws.send(JSON.stringify(dataToSend));
        }
      }
    };

    console.log("creating offer", offer);

    // peerConnection.addEventListener("iceconnectionstatechange", (e) => {
    //   console.log(peerConnection.iceConnectionState);
    // });

    const dataToSend: outgoingMessage = {
      type: "offer",
      to: id,
      from: myPublicId,
      room: get(drawing_room_id),
      data: offer,
    };

    ws.send(JSON.stringify(dataToSend));
  }

  async function receiveOffer(incoming: any) {
    console.log("received offer: ", incoming);
    const { from, data } = incoming;
    if (from === myPublicId) {
      console.warn("receiving my own offer");
    }

    const peerConnection = new RTCPeerConnection({ iceServers });
    peerConnections[from] = peerConnection;
    const dataChannel = peerConnection.createDataChannel(incoming.from);

    await peerConnection.setRemoteDescription(data);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

    peerConnection.onicecandidate = (event) => {
      console.log("ice candidate");
      if (event.candidate) {
        const dataToSend: outgoingMessage = {
          type: "iceCandidate",
          from: myPublicId,
          to: incoming.from,
          room: get(drawing_room_id),
          data: event.candidate,
        };
        if (peerConnection.localDescription) {
          ws.send(JSON.stringify(dataToSend));
        }
      }
    };

    const dataToSend: outgoingMessage = {
      type: "answer",
      to: from,
      from: myPublicId,
      room: get(drawing_room_id),
      data: answer,
    };

    console.log("creating answer", answer);

    ws.send(JSON.stringify(dataToSend));
  }

  async function receiveAnswer(incoming: any) {
    console.log("received answer", incoming.data);
    const { from, data } = incoming;
    await peerConnections[from].setRemoteDescription(
      new RTCSessionDescription(data),
    );
  }

  function startNegotiations() {
    peerIds.forEach((id) => {
      createOffer(id);
    });
  }

  function checkIceState() {
    console.log(Object.values(peerConnections)[0].iceGatheringState);
  }

  function checkLocalDesc() {
    console.log(Object.values(peerConnections)[0].localDescription);
  }

  function checkRemoteDesc() {
    console.log(Object.values(peerConnections)[0].remoteDescription);
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
        receiveOffer(parsed);
        break;
      case "answer":
        receiveAnswer(parsed);
        break;
      case "iceCandidate":
        handleIceCandidate(parsed);
        break;
    }
  }

  function testIce() {
    const pc = new RTCPeerConnection({ iceServers });
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("New ICE candidate:", event.candidate);
      }
    };
    pc.createDataChannel("test"); // This triggers ICE gathering
    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .then(() => {
        console.log("Offer set as local description");
      })
      .catch((error) => console.error("Error creating offer:", error));
    pc.onicegatheringstatechange = () => {
      console.log("ICE gathering state changed:", pc.iceGatheringState);
    };
    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state changed:", pc.iceConnectionState);
    };
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

<div class="debug-webrtc">
  <div>My Id: {myPublicId}</div>
  <div class="peerIds top">
    <div><strong>Other user's IDs</strong></div>
    <button style="width: auto" on:click={checkIceState}>Check Ice State</button>
    <button style="width: auto" on:click={checkLocalDesc}>Check Local Desc</button>
    <button style="width: auto" on:click={checkRemoteDesc}>Check Remote Desc</button>
    <button style="width: auto" on:click={testIce}>Test Ice</button>
    {#each peerIds as id}
      <div>{id}</div>
    {/each}
  </div>
</div>

<style>
  .debug-webrtc {
    background-color: white;
    height: 500px;
    width: 400px;
    position: fixed;
    right: 200px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1000;
    border-radius: 10%;
    padding: 20px;
  }

  .top {
    margin-top: 20px;
  }
</style>
