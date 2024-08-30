<script lang="ts">
  import { onDestroy } from "svelte";
  import {
    drawing_room_id,
    drawing_room_store,
    i_am_hosting,
    TransitionToDrawingRoom,
    UnpackTransition,
  } from "../../../stores/drawingRoomStore";
  import { alert_store } from "../../../stores/alertStore";
  import { event_state_store } from "../../../stores/eventState";
  import { navigate } from "svelte-routing";

  let drawingRoomId: string;

  const unsubscribe = drawing_room_id.subscribe((value) => {
    drawingRoomId = value;
  });

  onDestroy(() => {
    unsubscribe();
  });

  function handleCopy() {
    navigator.clipboard
      .writeText(`http://localhost:5173/${drawingRoomId}`)
      .then(() => {
        alert_store.set("alert:Link Copied!");
      });
  }

  function handleMakeDrawingRoom() {
    TransitionToDrawingRoom();
    drawing_room_store.set(true);
    i_am_hosting.set(true);
    navigate(`/${drawingRoomId}`, { replace: true });
    UnpackTransition();
    event_state_store.set("arrow");
  }

  function handleCancel() {
    event_state_store.set("arrow");
  }
</script>

<div class="overlay" />
<div class="cool confirm-drawing-room-form">
  <div class="top-row"><h3>Create Drawing Room</h3></div>
  <div class="paragraph">
    <p style="margin-bottom: 2rem;">You are about to host a public drawing room!</p>

    <p style="margin-bottom: 2rem;">
      Everyone will be able to see and edit this drawing.
    </p>

    <h3>Share the link to this room:</h3>
    <div class="url-container" style="margin-bottom: 3rem">
      <input
        type="text"
        class="url"
        value={`http://localhost:5173/${drawingRoomId}`}
      />
      <button style="width: auto;" on:click={handleCopy}>Copy</button>
    </div>

    Do you wish to proceed?
  </div>
  <div class="buttons">
    <button class="heh" style="width: auto;" on:click={handleMakeDrawingRoom}>
      Confirm
    </button>
    <button style="width: auto;" on:click={handleCancel}>Cancel</button>
  </div>
</div>

<style>
  h3 {
    margin-top: 0px;
  }

  input {
    margin-top: 0px;
  }

  .confirm-drawing-room-form {
    position: fixed;
    left: 50%;
    top: 100px;
    transform: translateX(-50%);
    z-index: 1004;
  }

  .url-container {
    margin-top: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 37rem;
    gap: 1rem;
  }

  .url {
    width: 100%;
  }

  .buttons {
    display: flex;
    gap: 10px;
    margin-top: 3rem;
  }
</style>
