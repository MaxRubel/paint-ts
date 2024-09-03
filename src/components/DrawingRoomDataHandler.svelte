<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    drawing_room_id,
    drawing_room_store,
    i_am_hosting,
    i_have_joined,
    myPublicId,
  } from "../../stores/drawingRoomStore";
  import { get } from "svelte/store";
  import { event_state_store } from "../../stores/eventState";
  import {
    CloseWebsocket,
    InitWebsockets,
  } from "../../utils/websockets/websocketHub";
  import {
    GracefulRTCExit,
    peerIds,
    peerStates,
    SendToAll,
  } from "../../utils/webRTC/webRTCNegotiate";
  import { textBoxesStore } from "../../stores/textBoxStore";
  import type { TextBoxType } from "../../utils/types/app_types";
  import { mousePositions } from "../../utils/webRTC/webRTCNegotiate";
  import type { mousePos } from "../../utils/webRTC/webRTCDataMessages";
  import PeerMouse from "./canvas elements/PeerMouse.svelte";
  import PeopleCounter from "./toolbars/PeopleCounter.svelte";
  import { undo_store } from "../../stores/undoStore";
  import { redo_store } from "../../stores/redoStore";

  let iHaveJoined: boolean;
  let peerIdArray: string[];
  let peerStateMap: { [key: string]: boolean };
  let textboxes: { [key: string]: TextBoxType };
  let mouseX: number = 0;
  let mouseY: number = 0;
  let peerMice: { [key: string]: mousePos };
  let interval: NodeJS.Timeout | null = null;

  $: iHaveJoined = $i_have_joined;
  $: peerIdArray = $peerIds;
  $: peerStateMap = $peerStates;
  $: peerMice = $mousePositions;

  const unsubscribe = textBoxesStore.subscribe((value) => {
    textboxes = value;
    SendToAll(`changingTextbox&*^${JSON.stringify(value)}`);
  });

  $: {
    if (iHaveJoined) {
      const id = InitWebsockets();
      startMouseTracker(id);
    }
  }

  function updateMousePosition(e: MouseEvent) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  let oldMousepos: mousePos = { id: "", x: 0, y: 0 };

  function startMouseTracker(id: string) {
    document.addEventListener("mousemove", updateMousePosition);

    interval = setInterval(() => {
      if (oldMousepos.x === mouseX && oldMousepos.y === mouseY) {
        //nothing changed
        return;
      }

      if (mouseX !== undefined && mouseY !== undefined) {
        const data = { id, x: mouseX, y: mouseY };
        oldMousepos = data;
        SendToAll(`mousepos&*^${JSON.stringify(data)}`);
      }
    }, 90);
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
      const id = InitWebsockets();
      startMouseTracker(id);
    } else {
      event_state_store.set("confirm_join_drawing_room_form");
    }

    undo_store.set([]);
    redo_store.set([]);
  });

  onDestroy(() => {
    i_have_joined.set(false);
    drawing_room_id.set("");
    drawing_room_store.set(false);

    unsubscribe();
    GracefulRTCExit();
    CloseWebsocket();
    stopMouseTracker();
  });
</script>

<PeopleCounter />
<div class="peer-video-stream-container">
  {#each Object.values(peerMice) as mouseData}
    <PeerMouse {mouseData} />
  {/each}
</div>

<style>
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
</style>
