<script lang="ts">
  import { get } from "svelte/store";
  import {
    CompileAndSaveDoodle,
    fetched_single,
  } from "../../../stores/fetchDataStore";
  import Close from "../../graphics/Close.svelte";
  import { undo_store } from "../../../stores/undoStore";
  import { event_state_store } from "../../../stores/eventState";
  import { ClearEverything } from "../../../stores/canvasStore";
  import { alert_store } from "../../../stores/alertStore";

  let oldEventState;
  function handleYes() {
    if (get(fetched_single).id) {
      oldEventState = get(event_state_store);
      CompileAndSaveDoodle("", true);
      undo_store.set([]);
      if (oldEventState.includes("view_doodles_form")) {
        event_state_store.set("view_doodles_form");
      }
      if (oldEventState.includes("new_doodle")) {
        ClearEverything();
      }
    } else {
      event_state_store.set("saving_new_project_form&view_doodles_form_after");
    }
  }
  function handleNo() {
    const eventState = get(event_state_store);
    if (eventState.includes("view_doodles_form")) {
      event_state_store.set("view_doodles_form");
    } else if (eventState.includes("new_doodle")) {
      ClearEverything();
      alert_store.set("alert:New drawing created!");
    }
  }

  function handleClose() {
    event_state_store.set("arrow");
  }
</script>

<div class="overlay" />
<div class="save-confirm-form fixed-center cool">
  <div class="grid">
    <div><h4>Do you want to save this doodle first?</h4></div>
    <div class="right">
      <button class="clear-button movedup" on:click={handleClose}><Close /></button>
    </div>
  </div>
  <div class="row">
    <button type="button" class="orange" on:click={handleYes}>Yes</button>
    <button type="button" on:click={handleNo}>No</button>
  </div>
</div>

<style>
  button {
    width: auto;
  }

  .orange {
    background-color: #535bf2;
  }
  .orange:hover {
    background-color: #4a4a4a;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
  }

  .right {
    display: flex;
    justify-content: flex-end;
  }

  .movedup {
    transform: translate(20px, -15px);
  }

  .row {
    margin-top: 40px;
    display: flex;
    gap: 8px;
  }
  .save-confirm-form {
    z-index: 1004;
  }
</style>
