<script lang="ts">
  import Lock from "../../graphics/Lock.svelte";
  import Unlock from "../../graphics/Unlock.svelte";
  import CursorPointer from "../../graphics/CursorPointer.svelte";
  import Marker from "../../graphics/Marker.svelte";
  import TextIcon from "../../graphics/TextIcon.svelte";
  import {
    event_state_store,
    locked_store,
    selected_store,
    theme_store,
  } from "../../../stores/eventState";
  import Eraser from "../../graphics/Eraser.svelte";

  export let handleLock;
  export let handle_arrow_mode;
  export let handle_drawing_mode;
  export let handle_textbox_mode;

  let mode = "";
  let locked = true;
  let event_state = "";
  let arrow = true;
  let selected = [];

  $: mode = $theme_store;
  $: locked = $locked_store;
  $: event_state = $event_state_store;
  $: selected = $selected_store;

  function handle_eraser_mode() {
    event_state_store.set("erasing");
  }

  $: {
    if (
      event_state === "arrow" ||
      event_state === "selecting" ||
      event_state === "selected"
    ) {
      arrow = true;
    } else {
      arrow = false;
    }
  }
</script>

<div class="tool-bar">
  <button
    on:click={handle_arrow_mode}
    class="smallside centered"
    style="background-color: {arrow ? '#535bf2' : ''}; padding: 18px"
  >
    <CursorPointer />
  </button>

  <button
    on:click={handle_drawing_mode}
    class="width64"
    style="background-color: {event_state === 'drawing' ? '#535bf2' : ''}"
  >
    <Marker />
  </button>
  <button
    on:click={handle_eraser_mode}
    style="background-color: {event_state === 'erasing' ? '#535bf2' : ''}"
  >
    <Eraser />
  </button>
  {#if event_state === "creating_text" || event_state.includes("typing")}
    <button
      on:click={handle_textbox_mode}
      class="width64"
      style="background-color:  #535bf2"
    >
      <TextIcon />
    </button>
  {:else}
    <button on:click={handle_textbox_mode}>
      <TextIcon />
    </button>
  {/if}
  <button on:click={handleLock} class="smallside">
    {#if locked}
      <Lock />
    {:else}
      <Unlock />
    {/if}
  </button>
</div>

<style>
  .tool-bar {
    position: fixed;
    display: flex;
    gap: 5px;
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
  }
</style>
