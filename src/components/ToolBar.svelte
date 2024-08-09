<script lang="ts">
  export let handleClear;
  export let handleDark;
  export let handleLock;
  export let handleSmootches;
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
  import { HandleUndo } from "../../stores/undoStore";
  import Sun from "../graphics/Sun.svelte";
  import Moon from "../graphics/Moon.svelte";
  import Kiss from "../graphics/Kiss.svelte";

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
  <!-- <div class="event-state">
    <div>
      <h3>{event_state.includes("typing") ? "typing" : event_state}</h3>
    </div>
    {#if event_state === "selecting" || event_state === "selected"}
      <div>selected: {selected.length}</div>
    {/if}
  </div> -->
  <div class="second-row" style="color: white">
    <div class="main-bar">
      <button
        on:click={handle_arrow_mode}
        class="smallside centered"
        style="background-color: {arrow ? '#9096ff' : ''}; padding: 18px"
      >
        <CursorPointer />
      </button>
      <button
        on:click={handle_drawing_mode}
        class="width64"
        style="background-color: {event_state === 'drawing' ? '#9096ff' : ''}"
      >
        <Marker />
      </button>
      {#if event_state === "creating_text" || event_state.includes("typing")}
        <button
          on:click={handle_textbox_mode}
          class="width64"
          style="background-color:  #9096ff"
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
    <!-- <button> <GearIcon /> </button> -->
    <div class="side-bar">
      <button class="bigside" on:click={HandleUndo}>Undo</button>
      <button
        on:click={handleDark}
        class="centered width64"
        style="padding: 10px"
      >
        {#if mode === "light"}
          <Moon />
        {:else}
          <Sun />
        {/if}
      </button>
      <button class="width64" on:click={handleSmootches}><Kiss /></button>
      <button on:click={handleClear} class="bigside">Clear</button>
    </div>

    <!-- <button
      on:click={handle_new_rectangle}
      style="background-color: {event_state === 'rectangle-draw'
        ? '#9096ff'
        : ''}"
    >
      <Rectangle />
    </button> -->
  </div>
</div>

<style>
  button {
    height: 44px;
  }

  .smallside {
    width: 60px;
  }

  .width64 {
    width: 64px;
  }

  .bigside {
    width: 80px;
  }

  .tool-bar {
    position: fixed;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    padding: 10px;
    gap: 8px;
    top: 0px;
    left: 0;
    width: 100%;
    height: 50px;
    z-index: 1000;
    box-sizing: border-box;
    background-color: rgba(0, 0, 0, 0.288);
  }

  .second-row {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-content: center;
    align-items: center;
  }

  .main-bar {
    display: flex;
    padding-right: 20px;
    justify-content: flex-end;
    align-items: center;
    gap: 5px;
  }

  /* .event-state {
    position: fixed;
    text-align: left;
    top: 60px;
    left: 13px;
    color: white;
  } */

  .side-bar {
    padding-left: 20px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 5px;
  }

  @media screen and (max-width: 630px) {
    .second-row {
      grid-template-columns: 1fr;
    }

    .main-bar {
      justify-content: center;
      padding-right: 0px;
    }

    .tool-bar {
      height: auto;
    }
    /* .event-state {
      top: 114px;
    } */
    .side-bar {
      margin-top: 4px;
      padding-left: 0px;
      justify-content: center;
    }
  }
  /* h3 {
    margin-bottom: 10px;
  } */
</style>
