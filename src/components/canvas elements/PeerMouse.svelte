<script lang="ts">
  import type { mousePos } from "../../../utils/webRTC/webRTCDataMessages";
  import MouseCursor from "../../graphics/MouseCursor.svelte";

  export let mouseData: mousePos;

  $: console.log({ x: mouseData.x, y: mouseData.y });
</script>

<div class="peer-mouse" style="top: {mouseData.y}px; left: {mouseData.x}px">
  <MouseCursor />
</div>

<style>
  .peer-mouse {
    position: absolute;
    z-index: 700;
    color: white;
    rotate: -70deg;
  }
</style>
