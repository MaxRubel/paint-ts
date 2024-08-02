<script lang="ts">
  export let handleClear;
  export let handleDark;
  export let handleLock;
  // export let handleSmootches;
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
  import { onDestroy, onMount } from "svelte";
  import { HandleUndo } from "../../stores/undoStore";
  import GearIcon from "../graphics/GearIcon.svelte";
  import Sun from "../graphics/Sun.svelte";
  import Moon from "../graphics/Moon.svelte";

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

  let dropdpwnOpen = false;

  function openDropdown() {
    dropdpwnOpen = true;
  }

  function closeDropdown() {
    dropdpwnOpen = false;
  }

  let dropdownMenu: any = "";

  // onMount(() => {
  //   document.addEventListener("click", handleClickOutside);
  // });

  // onDestroy(() => {
  //   document.addEventListener("remove", handleClickOutside);
  // });
  // let x = -308;
  // let interval: any;

  // function expandSideBar() {
  //   interval = setInterval(() => {
  //     x += 3;
  //     if (x >= 20) {
  //       clearInterval(interval);
  //     }
  //   }, 1);
  // }

  // function collapseSideBar() {
  //   interval = setInterval(() => {
  //     x -= 3;
  //     if (x === -300) {
  //       clearInterval(interval);
  //     }
  //   }, 1);
  // }

  // let sidebarIsOpen = false;
  // function handleExpandSideBar() {
  //   if (interval) {
  //     clearInterval(interval);
  //   }
  //   if (sidebarIsOpen) {
  //     collapseSideBar();
  //     sidebarIsOpen = false;
  //   } else {
  //     expandSideBar();
  //     sidebarIsOpen = true;
  //   }
  // }
</script>

<div class="tool-bar">
  <div class="event-state">
    <div>
      <h3>{event_state.includes("typing") ? "typing" : event_state}</h3>
    </div>
    {#if event_state === "selecting" || event_state === "selected"}
      <div>selected: {selected.length}</div>
    {/if}
  </div>
  <div class="second-row" style="color: white">
    <div class="main-bar">
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
      {#if event_state === "creating_text" || event_state.includes("typing")}
        <button
          on:click={handle_textbox_mode}
          style="background-color:  #9096ff"
        >
          <TextIcon />
        </button>
      {:else}
        <button on:click={handle_textbox_mode}>
          <TextIcon />
        </button>
      {/if}
      <button on:click={handleLock} style="width: 60px;">
        {#if locked}
          <Lock />
        {:else}
          <Unlock />
        {/if}
      </button>
    </div>
    <!-- <button> <GearIcon /> </button> -->
    <div class="side-bar">
      <button on:click={HandleUndo}>Undo</button>
      <button
        on:click={handleDark}
        class="centered"
        style="width: 60px; padding: 10px"
      >
        {#if mode === "light"}
          <Moon />
        {:else}
          <Sun />
        {/if}
      </button>
      <button on:click={handleClear}>Clear</button>
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
    height: 50px;
  }
  .tool-bar {
    position: fixed;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    padding: 10px;
    gap: 8px;
    top: 9px;
    left: 0;
    width: 100%;
    height: 65px;
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
    /* gap: 6px; */
  }

  .main-bar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 5px;
    /* margin-right: 15px; */
  }

  .event-state {
    position: fixed;
    text-align: left;
    top: 60px;
    left: 25px;
    color: white;
  }

  .side-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
  }

  @media screen and (max-width: 550px) {
    .second-row {
      grid-template-columns: 1fr;
    }

    .main-bar {
      justify-content: center;
    }

    .tool-bar {
      height: auto;
    }
    .event-state {
      top: 114px;
    }
    .side-bar {
      margin-top: 4px;
      /* margin-left: 30px; */
      /* position: absolute; */
      /* margin-left: 15px; */
    }
  }
  h3 {
    margin-bottom: 10px;
  }
</style>
