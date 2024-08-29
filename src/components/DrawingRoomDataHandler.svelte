<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    drawing_room_id,
    drawing_room_store,
    i_am_hosting,
    i_have_joined,
    myPublicId,
    other_peoples_textboxes,
  } from "../../stores/drawingRoomStore";
  import { get } from "svelte/store";
  import { event_state_store } from "../../stores/eventState";
  import { CloseWebsocket, InitWebsockets } from "../../utils/websocketHub";
  import {
    dataChannels,
    peerConnections,
    peerIds,
    peerStates,
    SendToAll,
  } from "../../utils/webRTCNegotiate";
  import { textBoxesStore } from "../../stores/textBoxStore";
  import type { TextBoxType } from "../../utils/types/app_types";
  import TextBox from "./canvas elements/Text_Box.svelte";
  import { mousePositions } from "../../utils/webRTCNegotiate";
  import type { mousePos } from "../../utils/webRTCDataMessages";
  import PeerMouse from "./canvas elements/PeerMouse.svelte";

  let iHaveJoined: boolean;
  let myId: string;
  let peerIdArray: string[];
  let peerStateMap: { [key: string]: boolean };
  let textboxes: { [key: string]: TextBoxType };
  let otherTextboxes: { [key: string]: TextBoxType };
  let mouseX: number = 0;
  let mouseY: number = 0;
  let peerMice: { [key: string]: mousePos };
  let interval: NodeJS.Timeout | null = null;

  const unsubscribe = i_have_joined.subscribe((value) => {
    iHaveJoined = value;
  });

  const unsubscribe2 = myPublicId.subscribe((value) => {
    myId = value;
  });

  const unsubscribe3 = peerIds.subscribe((value) => {
    peerIdArray = value;
  });

  const unsubscribe4 = peerStates.subscribe((value) => {
    peerStateMap = value;
  });

  const unsubscribe5 = textBoxesStore.subscribe((value) => {
    textboxes = value;
    SendToAll(`changingTextbox&*^${JSON.stringify(value)}`);
  });

  const unsubscribe6 = other_peoples_textboxes.subscribe((value) => {
    otherTextboxes = value;
  });

  const unsubscribe7 = mousePositions.subscribe((value) => {
    peerMice = value;
  });

  $: {
    if (iHaveJoined) {
      InitWebsockets();
    }
  }

  function updateMousePosition(e: MouseEvent) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  let oldMousepos: mousePos = { id: "", x: 0, y: 0 };

  function startMouseTracker() {
    document.addEventListener("mousemove", updateMousePosition);

    interval = setInterval(() => {
      if (oldMousepos.x === mouseX && oldMousepos.y === mouseY) {
        //nothing changed
        return;
      }

      if (mouseX !== undefined && mouseY !== undefined) {
        const data = { id: myId, x: mouseX, y: mouseY };
        oldMousepos = data;
        SendToAll(`mousepos&*^${JSON.stringify(data)}`);
      }
    }, 150);
  }

  function stopMouseTracker() {
    document.removeEventListener("mousemove", updateMousePosition);
    if (interval !== null) {
      clearInterval(interval);
      interval = null;
    }
  }

  onMount(() => {
    if (get(i_am_hosting)) {
      InitWebsockets();
    } else {
      event_state_store.set("confirm_join_drawing_room_form");
    }
    startMouseTracker();
  });

  onDestroy(() => {
    i_have_joined.set(false);
    drawing_room_id.set("");
    drawing_room_store.set(false);

    unsubscribe();
    unsubscribe2();
    unsubscribe3();
    unsubscribe4();
    unsubscribe5();
    unsubscribe6();
    unsubscribe7();
    CloseWebsocket();
    stopMouseTracker();
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
    Object.values(get(dataChannels)).forEach((chan) => {
      chan.send("hello this is a test thank u");
    });
  }
</script>

<div class="debug-webrtc">
  <div>My Id: {$myPublicId}</div>
  <div class="peerIds top">
    <!-- <button style="width: auto" on:click={checkIceState}>Check Ice State</button>
    <button style="width: auto" on:click={checkLocalDesc}>Check Local Desc</button>
    <button style="width: auto" on:click={checkRemoteDesc}>Check Remote Desc</button>
    <button style="width: auto" on:click={checkIceStatuses}>Check Ice Status</button>
    <button style="width: auto" on:click={sendDateMessage}>Send Data Message</button> -->
    <!-- <button style="width: auto" on:click={testIce}>Test Ice</button> -->
    <div><strong>Other user's IDs</strong></div>
    {#each peerIdArray as id}
      {#if peerStateMap[id]}
        <div style="color: green; width: 100%">{id}</div>
      {:else}
        <div style="color: red; width: 100%">{id}</div>
      {/if}
    {/each}
  </div>
</div>
{#if otherTextboxes}
  {#each Object.values(otherTextboxes) as textbox}
    <TextBox data={textbox} />
  {/each}
{/if}
<div class="peer-video-stream-container">
  <!-- {#each $peerIds as peerId}
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
    <canvas id={`canvas-element-${peerId}`} class="peer-canvas"> </canvas>
  {/each} -->
  {#each Object.values(peerMice) as mouseData}
    <PeerMouse {mouseData} />
  {/each}
</div>

<style>
  .debug-webrtc {
    background-color: white;
    height: 500px;
    width: 100px;
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
    display: hidden;
    opacity: 0;
  }

  .peer-canvas {
    height: 2000px;
    width: 3000px;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 800;
    pointer-events: none;
    background-color: transparent !important;
    object-fit: fit;
  }

  .top {
    margin-top: 20px;
  }
</style>
