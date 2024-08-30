<script lang="ts">
  import { onDestroy } from "svelte";
  import { drawing_room_id, i_have_joined } from "../../../stores/drawingRoomStore";
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

  function joinDrawingRoom() {
    event_state_store.set("arrow");
    i_have_joined.set(true);
  }

  function handleCancel() {
    navigate("/");
    event_state_store.set("arrow");
  }
</script>

<div class="overlay" />
<div class="cool confirm-drawing-room-form">
  <div class="top-row"><h3>Join Drawing Room</h3></div>
  <div class="paragraph">
    <p style="margin-bottom: 1.5rem;">
      You are about to join a public drawing room!
    </p>

    <p style="margin-bottom: 3rem;">
      Everyone will be able to view and edit this drawing.
    </p>

    Do you wish to proceed?
  </div>
  <div class="buttons">
    <button class="heh" style="width: auto;" on:click={joinDrawingRoom}>
      Confirm
    </button>
    <button style="width: auto;" on:click={handleCancel}>Cancel</button>
  </div>
</div>

<style>
  h3 {
    margin-top: 0px;
  }

  .confirm-drawing-room-form {
    position: fixed;
    left: 50%;
    top: 100px;
    transform: translateX(-50%);
    z-index: 1004;
  }

  .buttons {
    display: flex;
    gap: 10px;
    margin-top: 3rem;
  }
</style>
