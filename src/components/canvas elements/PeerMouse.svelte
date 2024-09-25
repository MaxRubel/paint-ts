<script lang="ts">
  import type { mousePos } from "../../../utils/webRTC/webRTCDataMessages";
  import MouseCursor from "../../graphics/MouseCursor.svelte";

  export let mouseData: mousePos;
  export let scrollLeft: number;
  export let scrollTop: number;

  $: adjustedX = mouseData.x - scrollLeft;
  $: adjustedY = mouseData.y - scrollTop;
</script>

<div class="peer-mouse" style="top: {adjustedY}px; left: {adjustedX}px">
  <MouseCursor />
</div>

<style>
  .peer-mouse {
    position: fixed;
    z-index: 700;
    color: white;
    rotate: -70deg;
  }
</style>
