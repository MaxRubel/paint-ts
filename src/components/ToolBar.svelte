<script>
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
    selected_store,
    theme_store,
  } from "../../stores/eventState";
  import { onDestroy } from "svelte";
  import { HandleUndo } from "../../stores/undoStore";

  let mode = "";
  let locked = true;
  let event_state = "";
  let arrow = true;
  let selected = [];

  const unsubscribe = theme_store.subscribe((value) => {
    mode = value;
  });

  const unsubscribe2 = locked_store.subscribe((value) => {
    locked = value;
  });

  const unsubscribe3 = event_state_store.subscribe((value) => {
    event_state = value;
  });

  const unsubscribe4 = selected_store.subscribe((value) => {
    selected = value;
  });

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

  onDestroy(() => {
    unsubscribe();
    unsubscribe2();
    unsubscribe3();
    unsubscribe4();
  });
</script>

<div class="tool-bar">
  <div class="event-state">
    <div><h3>{event_state}</h3></div>
    <div>selected: {selected.length}</div>
  </div>
  <div class="top-row">
    <button on:click={HandleUndo}>Undo</button>
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
      style="background-color: {arrow ? '#9096ff' : ''}"
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
    position: fixed;
    text-align: left;
    top: 90px;
    left: 50px;
    color: white;
  }
  h3 {
    margin-bottom: 10px;
  }
</style>
