<script lang="ts">
  import { onDestroy } from "svelte";
  import { brush_size_store } from "../../../stores/brushStore";
  import { event_state_store, locked_store, selected_store } from "../../../stores/eventState";

  let brushSize: Number;
  let eventState: string;
  let lockedStore: boolean;
  let selectedStore: any;
  let selectedAmount: number;
  let fetchedDrawing;

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

  // export const locked_store = writable(true)

  // export const selected_store = writable<any[]>([])

  onDestroy(() => {
    unsubscribe();
    unsubscribe2();
    unsubscribe3();
    unsubscribe4();
  });
</script>

<div class="debug-menu">
  <h4>Debug Menu</h4>
  <div class="extend">Event: {eventState}</div>
  {#if selectedAmount > 0}
    <div class="extend">No. Selected: {selectedAmount}</div>
  {/if}
  <div class="extend">Locked {lockedStore}</div>
  <div class="extend">Brush Size: {brushSize}</div>
</div>

<style>
  .debug-menu {
    position: fixed;
    z-index: 1003;
    top: 50px;
    right: 0;
    width: 200px;
    background-color: rgb(255, 255, 255);
    height: 100%;
    overflow-y: auto;
    padding: 15px;
  }

  .extend {
    display: flex;
    width: 100%;
  }
</style>
