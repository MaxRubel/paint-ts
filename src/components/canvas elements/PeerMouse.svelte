<script lang="ts">
  import type { mousePos } from "../../../utils/webRTCDataMessages";
  import MouseCursor from "../../graphics/MouseCursor.svelte";

  export let mouseData: mousePos;
</script>

<div class="peer-mouse" style="top: {mouseData.y}px; left: {mouseData.x}px">
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
