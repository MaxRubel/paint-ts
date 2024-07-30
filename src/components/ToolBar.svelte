<script>
  export let handleUndo;
  export let handleClear;
  export let handleDark;
  export let handleLock;
  export let handleSmootches;
  export let handle_arrow_mode;
  export let handle_drawing_mode;
  export let handle_new_rectangle;
  export let handle_textbox_mode;

  import Lock from "../graphics/Lock.svelte";
  import Unlock from "../graphics/Unlock.svelte";
  import CursorPointer from "../graphics/CursorPointer.svelte";
  import Marker from "../graphics/Marker.svelte";
  import TextIcon from "../graphics/TextIcon.svelte";
  import Rectangle from "../graphics/Rectangle.svelte";
  import {
    event_state_store,
    locked_store,
    theme_store,
  } from "../../stores/eventState";
  import { onDestroy } from "svelte";

  let mode = "";
  let locked = true;
  let event_state = "";

  const unsubscribe = theme_store.subscribe((value) => {
    mode = value;
  });

  const unsubscribe2 = locked_store.subscribe((value) => {
    locked = value;
  });

  const unsubscribe3 = event_state_store.subscribe((value) => {
    event_state = value;
  });

  onDestroy(() => {
    unsubscribe();
    unsubscribe2();
    unsubscribe3();
  });
</script>

<div class="tool-bar">
  <div class="event-state">
    {event_state}
  </div>
  <div class="top-row">
    <button on:click={handleUndo}>Undo</button>
    <button on:click={handleClear}>Clear</button>
    <button on:click={handleDark}>
      {mode === "light" ? "Dark" : "Light"}
    </button>
    <button on:click={handleLock}>
      {#if locked}
        <Lock />
      {:else}
        <Unlock />
      {/if}
    </button>
    <button on:click={handleSmootches}>Smooches</button>
  </div>
  <div class="second-row" style="color: white">
    <button
      on:click={handle_arrow_mode}
      style="background-color: {event_state === 'arrow' ? '#9096ff' : ''}"
    >
      <CursorPointer />
    </button>
    <button
      on:click={handle_drawing_mode}
      style="background-color: {event_state === 'drawing' ? '#9096ff' : ''}"
    >
      <Marker />
    </button>
    {#if event_state === "createTextBox" || event_state.includes("typing")}
      <button on:click={handle_textbox_mode} style="background-color:  #9096ff">
        <TextIcon />
      </button>
    {:else}
      <button on:click={handle_textbox_mode}>
        <TextIcon />
      </button>
    {/if}

    <button
      on:click={handle_new_rectangle}
      style="background-color: {event_state === 'rectangle-draw'
        ? '#9096ff'
        : ''}"
    >
      <Rectangle />
    </button>
  </div>
</div>

<style>
  .tool-bar {
    position: fixed;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
    top: 9px;
    left: 0;
    width: 100%;
    height: 100px;
    z-index: 1000;
    box-sizing: border-box;
    background-color: rgba(0, 0, 0, 0.288);
  }

  .event-state {
    position: absolute;
    top: 80px;
    left: 50px;
    color: white;
  }
</style>
