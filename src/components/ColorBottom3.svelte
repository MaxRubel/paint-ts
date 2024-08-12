<script>
  // @ts-nocheck

  import { onDestroy } from "svelte";
  import { event_state_store } from "../../stores/eventState";
  import Slider from "./Slider.svelte";

  let eventState;

  const unsubcribe = event_state_store.subscribe((value) => {
    eventState = value;
  });

  onDestroy(unsubcribe);
</script>

<div class="color-bar-3">
  {#if eventState === "drawing"}
    <div class="slider">
      Stroke:
      <div class="centered"><Slider /></div>
    </div>
  {/if}
</div>

<style>
  .color-bar-3 {
    position: fixed;
    color: white;
    border-radius: 10px;
    width: 250px;
    height: 500px;
    background-color: rgba(245, 222, 179, 0.341);
    left: 4;
    padding: 10px;
    top: 400px;
    transform: translateY(-50%);
  }
</style>
