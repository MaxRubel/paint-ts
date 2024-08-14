<script lang="ts">
  import { onDestroy } from "svelte";
  import { event_state_store } from "../../../stores/eventState";

  let eventState: string;
  let message: string = "";
  let top: number = -64;
  let timeout: NodeJS.Timeout;

  const unsubcribe = event_state_store.subscribe((value) => {
    eventState = value;
  });

  $: {
    if (eventState.includes("alert")) {
      message = eventState.split(":")[1];
      top = 0;
      timeout = setTimeout(() => {
        top = -64;
      }, 2000);
      event_state_store.set("arrow");
    }
  }

  onDestroy(() => {
    unsubcribe();
    if (timeout) {
      clearTimeout(timeout);
    }
  });
</script>

<div class="alert" style="top: {top}px">{message}</div>

<style>
  .alert {
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1001;
    height: 30px;
    left: 120px;
    border-radius: 10px;
    padding: 15px;
    background-color: white;
    transition: all 0.6s ease;
    background-color: white;
    border-radius: 12px;
    border: 2px solid rgba(255, 255, 255, 0.198);
    color: black;
  }
</style>
