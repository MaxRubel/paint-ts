<script lang="ts">
  import { event_state_store } from "../../../stores/eventState";
  import { onDestroy } from "svelte";
  import Slider from "./Slider.svelte";
  import { brush_size_store } from "../../../stores/brushStore";
  import EraserStroke from "../../graphics/EraserStroke.svelte";

  let isVisible: boolean;
  let eventState: string;
  let brushStroke: number;

  const unsubcribe = event_state_store.subscribe((value) => {
    eventState = value;
  });

  const unsubscribe2 = brush_size_store.subscribe((value) => {
    brushStroke = value;
  });

  onDestroy(() => {
    unsubcribe();
    unsubscribe2();
  });

  $: {
    if (eventState === "erasing") {
      isVisible = true;
    } else {
      isVisible = false;
    }
  }
</script>

<div class="cool eraser-menu" class:isVisible>
  <div class="eraser-header">Eraser Size</div>
  <div class="slider-container"><Slider /></div>
  <div class="stroke-container centered">
    <EraserStroke size={brushStroke + 3} />
  </div>
</div>

<style>
  .eraser-menu {
    position: fixed;
    color: white;
    border-radius: 20px;
    background-color: rgb(25, 29, 31);
    left: 15px;
    padding: 20px;
    top: 100px;
    display: none;
    flex-direction: column;
    border: 2px solid rgba(255, 255, 255, 0.198);
    width: 208px;
    z-index: 800;
  }

  .isVisible {
    display: block;
  }

  .eraser-header {
    text-align: center;
    margin-bottom: 5px;
  }

  .stroke-container {
    margin-top: 10px;
    height: 45px;
  }
</style>
