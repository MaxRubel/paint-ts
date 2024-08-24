<script lang="ts">
  import { onDestroy } from "svelte";
  import {
    drawing_room_id,
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
  <div class="top-row"><h3>Create Drawing Room?</h3></div>
  <div class="paragraph">
    <p style="margin-bottom: 3rem;">
      Are you sure you want to create a public drawing room?
    </p>

    <p>By creating this room, you agree to the following:</p>

    <p>1. The drawing canvas will be accessible to anyone with the URL.</p>
    <p>2. Any user with the link can view and contribute to the drawing.</p>
    <p style="margin-bottom: 3rem;">
      3. The content of the drawing will be visible to the public.
    </p>

    <h3>Share this link:</h3>
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
    <button class="heh" style="width: auto;" on:click={handleMakeDrawingRoom}
      >Confirm</button
    >
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
