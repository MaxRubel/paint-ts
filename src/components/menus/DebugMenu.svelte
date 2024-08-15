<script lang="ts">
  import { onDestroy } from "svelte";
  import { brush_size_store } from "../../../stores/brushStore";
  import { event_state_store, locked_store, selected_store } from "../../../stores/eventState";
  import { fetched_all, fetched_single } from "../../../stores/fetchDataStore";
  import { undo_store } from "../../../stores/undoStore";

  let brushSize: Number;
  let eventState: string;
  let lockedStore: boolean;
  let selectedStore: any;
  let selectedAmount: number;
  let fetchedDrawing: any;
  let fetchedMany: any;
  let undoArraySize: number;

  const unsubscribe = brush_size_store.subscribe((value) => {
    brushSize = value;
  });

  const unsubscribe2 = event_state_store.subscribe((value) => {
    eventState = value;
    if (eventState.includes("typing")) {
      eventState = "typing";
    }
    if (eventState.includes("alert")) {
      eventState = "alert";
    }
  });

  const unsubscribe3 = locked_store.subscribe((value) => {
    lockedStore = value;
  });

  const unsubscribe4 = selected_store.subscribe((value) => {
    selectedStore = value;
    selectedAmount = value.length;
  });

  const unsubscribe5 = fetched_single.subscribe((value) => {
    fetchedDrawing = value;
  });

  const unsubscribe6 = fetched_all.subscribe((value) => {
    fetchedMany = value;
  });

  const unsubscribe7 = undo_store.subscribe((value) => {
    undoArraySize = value.length;
  });

  onDestroy(() => {
    unsubscribe();
    unsubscribe2();
    unsubscribe3();
    unsubscribe4();
    unsubscribe5();
    unsubscribe6();
    unsubscribe7();
  });
</script>

<div class="debug-menu">
  <h4 class="centered" style="margin-top: 0px;">Debug Menu</h4>
  <div class="extend"><strong>Event</strong>:&nbsp;&nbsp;{eventState}</div>
  {#if selectedAmount > 0}
    <div class="extend">No. Selected:&nbsp;&nbsp;{selectedAmount}</div>
  {/if}
  <div class="extend"><strong>Locked</strong>&nbsp;&nbsp;{lockedStore}</div>
  <div class="extend"><strong>Brush Size:</strong>&nbsp;&nbsp;{brushSize}</div>
  <div class="extend"><strong>Undo Items</strong>&nbsp;&nbsp;{undoArraySize}</div>
  <h4 class="centered">Data</h4>
  {#if fetchedDrawing.id}
    <div class="drawing">
      <div class="pre-wrap centered">-----------Drawing-----------</div>
      <div class="extend"><strong>id: </strong>&nbsp;&nbsp;{fetchedDrawing.id}</div>
      <div class="extend"><strong>name: </strong>&nbsp;&nbsp;{fetchedDrawing.name}</div>
      <div class="extend">
        <strong>date created: </strong>&nbsp;&nbsp;{fetchedDrawing.date_created}
      </div>
      <div class="extend">
        <strong>collabs: </strong>&nbsp;&nbsp;{fetchedDrawing.collaborators.length}
      </div>
    </div>
  {:else}
    <div class="pre-wrap centered">------------Drawing------------</div>
    <div>No drawing is loaded...</div>
  {/if}
  <div class="many-fetched">
    <div class="top centered">------------User Data------------</div>
    {#each fetchedMany.yourDoodles as doodle}
      <div style="font-size: 14px; ">
        <div><strong>id:</strong> {doodle.id}</div>
        <div><strong>name:</strong> {doodle.name}</div>
        <div><strong>date_created:</strong> {doodle.date_created}</div>
        <div><strong>collabs:</strong> {doodle.collaborators.length}</div>
      </div>
    {/each}
  </div>
</div>

<style>
  .debug-menu {
    position: fixed;
    z-index: 1003;
    top: 50px;
    right: 0;
    width: 200px;
    background-color: rgb(255, 255, 255);
    overflow-y: auto;
    padding: 15px;
    border-radius: 10px;
  }

  .drawing {
    white-space: nowrap;
  }

  .top {
    margin-top: 40px;
  }

  .extend {
    display: flex;
    width: 100%;
    white-space: nowrap;
  }

  .pre-wrap {
    white-space: pre-wrap;
  }
</style>
