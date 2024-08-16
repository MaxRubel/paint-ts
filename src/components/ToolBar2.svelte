<script lang="ts">
  export let handleLock;
  export let handle_arrow_mode;
  export let handle_drawing_mode;
  export let handle_textbox_mode;

  import Lock from "../graphics/Lock.svelte";
  import Unlock from "../graphics/Unlock.svelte";
  import CursorPointer from "../graphics/CursorPointer.svelte";
  import Marker from "../graphics/Marker.svelte";
  import TextIcon from "../graphics/TextIcon.svelte";
  import {
    event_state_store,
    locked_store,
    selected_store,
    theme_store,
  } from "../../stores/eventState";
  import { onDestroy } from "svelte";

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
    if (event_state === "arrow" || event_state === "selecting" || event_state === "selected") {
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
  <button
    on:click={handle_arrow_mode}
    class="smallside centered"
    style="background-color: {arrow ? '#00695C' : ''}; padding: 18px"
  >
    <CursorPointer />
  </button>

  <button
    on:click={handle_drawing_mode}
    class="width64"
    style="background-color: {event_state === 'drawing' ? '#00695C' : ''}"
  >
    <Marker />
  </button>
  {#if event_state === "creating_text" || event_state.includes("typing")}
    <button on:click={handle_textbox_mode} class="width64" style="background-color:  #00695C">
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
    /* width: 200px; */
    transform: translateX(-50%);

    z-index: 1000;
    /* background-color: aqua; */
  }
</style>
