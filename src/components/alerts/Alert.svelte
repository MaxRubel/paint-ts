<script lang="ts">
  import { onDestroy } from "svelte";
  import { event_state_store } from "../../../stores/eventState";
  import { alert_store } from "../../../stores/alertStore";

  let alert: string;
  let message = "";
  let top = -64;
  let timeout: NodeJS.Timeout;

  const unsubcribe = alert_store.subscribe((value) => {
    alert = value;
  });

  $: {
    if (alert.includes("alert")) {
      message = alert.split(":")[1];
      top = 0;
      timeout = setTimeout(() => {
        top = -64;
      }, 2000);
      alert_store.set("");
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
    height: 22px;
    left: 120px;
    padding: 15px;
    transition: all 0.6s ease;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    border: 2px solid rgba(255, 255, 255, 0.198);
    background-color: rgb(31, 38, 43, 0.97);
    color: rgb(255, 255, 255);
  }
</style>
