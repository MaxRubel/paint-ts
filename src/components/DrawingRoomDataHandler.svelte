<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { InitWShandshake } from "../../utils/initDrawingRoomSocket";
  import {
    drawing_room_id,
    i_am_hosting,
    i_have_joined,
  } from "../../stores/drawingRoomStore";
  import { get } from "svelte/store";
  import { event_state_store } from "../../stores/eventState";

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
  let peerStates: { [key: string]: boolean } = {};
  let peerConnections: { [key: string]: RTCPeerConnection } = {};
  let dataChannels: { [key: string]: RTCDataChannel } = {};
  let myPublicId: string;
  let ws: WebSocket;
  let iHaveJoined: boolean;

  const unsubscribe = i_have_joined.subscribe((value) => {
    iHaveJoined = value;
  });

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
    const peerConnection = peerConnections[from];

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

  async function createOffer(id: string) {
    const peerConnection = new RTCPeerConnection({ iceServers });
    const dataChannel = peerConnection.createDataChannel(id);

    peerConnections[id] = peerConnection;
    peerStates[id] = false;
    dataChannels[id] = dataChannel;

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

      dataChannel.onmessage = (messageEvent) => {
        console.log("Received message:", messageEvent.data);
      };
    };

    peerConnection.onicecandidate = (event) => {
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

    peerConnection.addEventListener("connectionstatechange", (event) => {
      if (peerConnection.connectionState === "connected") {
        peerStates[id] = true;
      }
    });

    const dataToSend: outgoingMessage = {
      type: "offer",
      to: id,
      from: myPublicId,
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
      }
    };

    ws.send(JSON.stringify(dataToSend));
  }

  async function receiveOffer(incoming: any) {
    const { from, data } = incoming;
    if (from === myPublicId) {
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

    peerConnections[from] = peerConnection;
    peerStates[from] = false;
    peerIds.push(from);
    dataChannels[from] = dataChannel;

    await peerConnection.setRemoteDescription(data);

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

    peerConnection.ondatachannel = (event) => {
      const dataChannel = event.channel;

      dataChannel.onmessage = (messageEvent) => {
        console.log("Received message:", messageEvent.data);
      };

      dataChannel.onopen = () => {
        console.log("Data channel is open and ready to use");
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
      }
    };

    peerConnection.onicecandidate = (event) => {
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

    peerConnection.addEventListener("connectionstatechange", (event) => {
      if (peerConnection.connectionState === "connected") {
        peerStates[from] = true;
      }
    });

    const dataToSend: outgoingMessage = {
      type: "answer",
      to: from,
      from: myPublicId,
      room: get(drawing_room_id),
      data: answer,
    };

    ws.send(JSON.stringify(dataToSend));
  }

  async function receiveAnswer(incoming: any) {
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

  function checkIceStatuses() {
    Object.values(peerConnections).forEach((pc) => {
      console.log(pc.connectionState);
    });
  }

  function InitWebsockets() {
    console.log("initing websockets");
    const { socket, userId } = InitWShandshake();
    myPublicId = userId;
    ws = socket;
    ws.onmessage = (e) => {
      parseMessage(e);
    };
  }

  $: {
    if (iHaveJoined) {
      InitWebsockets();
    }
  }

  onMount(() => {
    if (get(i_am_hosting)) {
      InitWebsockets();
    } else {
      event_state_store.set("confirm_join_drawing_room_form");
    }
  });

  onDestroy(() => {
    unsubscribe();
    i_have_joined.set(false);
  });

  //debug functions
  function checkIceState() {
    console.log(Object.values(peerConnections)[0].iceGatheringState);
  }

  function checkLocalDesc() {
    console.log(Object.values(peerConnections)[0].localDescription);
  }

  function checkRemoteDesc() {
    console.log(Object.values(peerConnections)[0].remoteDescription);
  }

  function sendDateMessage() {
    Object.values(dataChannels).forEach((chan) => {
      chan.send("hello this is a test thank u");
    });
  }
</script>

<div class="debug-webrtc">
  <div>My Id: {myPublicId}</div>
  <div class="peerIds top">
    <button style="width: auto" on:click={checkIceState}>Check Ice State</button>
    <button style="width: auto" on:click={checkLocalDesc}>Check Local Desc</button>
    <button style="width: auto" on:click={checkRemoteDesc}>Check Remote Desc</button>
    <button style="width: auto" on:click={checkIceStatuses}>Check Ice Status</button>
    <button style="width: auto" on:click={sendDateMessage}>Send Data Message</button>
    <!-- <button style="width: auto" on:click={testIce}>Test Ice</button> -->
    <div><strong>Other user's IDs</strong></div>
    {#each peerIds as id}
      {#if peerStates[id]}
        <div style="color: green; width: 100%">{id}</div>
      {:else}
        <div style="color: red; width: 100%">{id}</div>
      {/if}
    {/each}
  </div>
</div>

<div class="peer-video-stream-container">
  {#each peerIds as peerId}
    <video
      class="peer-video"
      height="2000px"
      width="3000px"
      id={`video-element-${peerId}`}
      autoplay
      playsinline
    >
      <track kind="captions" />
    </video>
  {/each}
</div>

<style>
  .debug-webrtc {
    background-color: white;
    height: 500px;
    width: 400px;
    position: fixed;
    right: 10px;
    top: 70px;
    z-index: 1000;
    border-radius: 10%;
    padding: 20px;
  }

  .peer-video-stream-container {
    height: 2000px;
    width: 3000px;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 800;
    pointer-events: none;
    background-color: transparent;
  }

  .peer-video {
    height: 2000px;
    width: 3000px;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 800;
    pointer-events: none;
    background-color: transparent !important;
    opacity: 1;
  }

  .top {
    margin-top: 20px;
  }
</style>
