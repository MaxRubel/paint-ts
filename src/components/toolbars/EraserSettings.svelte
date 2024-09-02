<script lang="ts">
  import { event_state_store } from "../../../stores/eventState";
  import { onDestroy } from "svelte";
  import Slider from "./Slider.svelte";
  import { brush_size_store } from "../../../stores/brushStore";
  import EraserStroke from "../../graphics/EraserStroke.svelte";
  import SideBarCollapseButton from "./SideBarCollapseButton.svelte";
  import { side_bar_hidden_store } from "../../../stores/userPrefsStore";

  let isVisible: boolean;
  let eventState: string;
  let brushStroke: number;
  let sidebarHidden: boolean;

  $: eventState = $event_state_store;
  $: brushStroke = $brush_size_store;
  $: sidebarHidden = $side_bar_hidden_store;

  $: {
    if (eventState === "erasing") {
      isVisible = true;
    } else {
      isVisible = false;
    }
  }

  let left = 15;

  $: {
    if (sidebarHidden) {
      left = -255;
    } else {
      left = 15;
    }
  }
</script>

<div class="cool eraser-menu" style="left: {left}px" class:isVisible>
  <SideBarCollapseButton {sidebarHidden} />
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
    top: 70px;
    display: none;
    flex-direction: column;
    border: 2px solid rgba(255, 255, 255, 0.198);
    width: 208px;
    z-index: 800;
    transition: all 0.8s ease;
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
