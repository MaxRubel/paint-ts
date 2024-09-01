<script lang="ts">
  import { onDestroy } from "svelte";
  import { brush_size_store } from "../../../stores/brushStore";
  import {
    event_state_store,
    locked_store,
    selected_store,
  } from "../../../stores/eventState";
  import { fetched_all, fetched_single } from "../../../stores/fetchDataStore";
  import { undo_store } from "../../../stores/undoStore";
  import { redo_store } from "../../../stores/redoStore";
  import {
    active_color_store,
    active_palette_store,
    border_index_store,
    editting_tile_store,
    type PaletteType,
  } from "../../../stores/paletteStore";
  import {
    drawing_room_id,
    drawing_room_store,
    i_am_hosting,
  } from "../../../stores/drawingRoomStore";

  let brushSize: Number;
  let eventState: string;
  let lockedStore: boolean;
  let selectedStore: any;
  let selectedAmount: number;
  let fetchedDrawing: any;
  let fetchedMany: any;
  let undoArraySize: number;
  let redoArraySize: number;
  let activePalette: PaletteType;
  let edittingTile: number | null;
  let activeColor: string;
  let borderIndex: number | null;
  let drawingRoomStore: boolean;
  let drawingRoomId: string;
  let iAmHosting: boolean;

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

  const unsubscribe8 = redo_store.subscribe((value) => {
    redoArraySize = value.length;
  });

  const unsubscribe9 = active_palette_store.subscribe((value) => {
    activePalette = value;
  });

  const unsubscribe10 = editting_tile_store.subscribe((value) => {
    edittingTile = value;
  });

  const unsubscribe11 = active_color_store.subscribe((value) => {
    activeColor = value;
  });

  const unsubscribe12 = border_index_store.subscribe((value) => {
    borderIndex = value;
  });

  const unsubcribe13 = drawing_room_store.subscribe((value) => {
    drawingRoomStore = value;
  });

  const unsubcribe14 = drawing_room_id.subscribe((value) => {
    drawingRoomId = value;
  });

  const unsubcribe15 = i_am_hosting.subscribe((value) => {
    iAmHosting = value;
  });

  onDestroy(() => {
    unsubscribe();
    unsubscribe2();
    unsubscribe3();
    unsubscribe4();
    unsubscribe5();
    unsubscribe6();
    unsubscribe7();
    unsubscribe8();
    unsubscribe9();
    unsubscribe10();
    unsubscribe11();
    unsubscribe12();
    unsubcribe13();
    unsubcribe14();
    unsubcribe15();
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
  <div class="extend"><strong>Redo Items</strong>&nbsp;&nbsp;{redoArraySize}</div>
  <div class="pre-wrap centered">-------Drawing-Room------</div>
  <div class="extend">
    <strong>Drawing Room Active</strong>&nbsp;&nbsp;{drawingRoomStore}
  </div>
  <!-- {#if drawingRoomStore} -->
  <div class="extend">
    <strong>Drawing Room ID</strong>&nbsp;&nbsp;{drawingRoomId}
  </div>
  <div class="extend"><strong>I am hosting:</strong>&nbsp;&nbsp;{iAmHosting}</div>
  <!-- {/if} -->
  <h4 class="centered">Data</h4>
  {#if fetchedDrawing.id}
    <div class="drawing">
      <div class="pre-wrap centered">---------Drawing---------</div>
      <div class="extend"><strong>id: </strong>&nbsp;&nbsp;{fetchedDrawing.id}</div>
      <div class="extend">
        <strong>name: </strong>&nbsp;&nbsp;{fetchedDrawing.name}
      </div>
      <div class="extend">
        <strong>date created: </strong>&nbsp;&nbsp;{fetchedDrawing.date_created}
      </div>
      <div class="extend">
        <strong>collabs: </strong>&nbsp;&nbsp;{fetchedDrawing.collaborators.length}
      </div>
    </div>
  {:else}
    <div class="pre-wrap centered">---------Drawing---------</div>
    <div>No drawing is loaded...</div>
  {/if}
  <div class="many-fetched">
    <div class="top centered">--------User Data--------</div>
    <div class="centered" style="font-size: 14px;">Fetched drawings:</div>
    <div class="fetched-container">
      {#each fetchedMany.yourDoodles as doodle}
        <div style="font-size: 14px; margin-bottom: 6px">
          <div><strong>id:</strong> {doodle.id}</div>
          <div><strong>name:</strong> {doodle.name}</div>
          <div><strong>date_created:</strong> {doodle.date_created}</div>
          <div><strong>collabs:</strong> {doodle.collaborators.length}</div>
        </div>
      {/each}
    </div>
  </div>
  <div class="palette">
    <div class="top centered">--------Palette--------</div>
    <div style="font-size: 14px;">
      <strong>Active Color: &nbsp;</strong>
      {activeColor}
    </div>
    {#if !activePalette.id}
      Palette has not been saved
    {/if}
    <div><strong>Name: &nbsp;</strong> {activePalette.name}</div>
    <div><strong>Editting Tile: &nbsp;</strong> {edittingTile}</div>
    <div><strong>Border Index: &nbsp;</strong> {borderIndex}</div>
    <div>
      <div><strong>Colors &nbsp;</strong></div>
      {#each activePalette.colors as color}
        <div style="font-size: 12px;">{color}</div>
      {/each}
    </div>
  </div>
</div>

<style>
  .debug-menu {
    position: fixed;
    z-index: 1003;
    top: 70px;
    right: 0;
    width: 215px;
    background-color: rgb(192, 189, 189);
    overflow-y: auto;
    padding: 15px;
    border-radius: 10px;
  }

  .drawing {
    white-space: nowrap;
  }

  .top {
    margin-top: 10px;
  }

  .extend {
    display: flex;
    width: 100%;
    white-space: nowrap;
  }

  .pre-wrap {
    white-space: pre-wrap;
  }

  .fetched-container {
    overflow: auto;
    max-height: 300px;
  }
</style>
