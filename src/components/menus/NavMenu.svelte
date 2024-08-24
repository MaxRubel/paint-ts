<script lang="ts">
  import { onDestroy } from "svelte";
  import NavButton from "../../graphics/NavButton.svelte";
  import { event_state_store } from "../../../stores/eventState";
  import { signIn, signOut } from "../../../utils/auth/firebase";
  import { authStore } from "../../../utils/auth/auth_store";
  import { get } from "svelte/store";
  import {
    CompileAndSaveDoodle,
    EmptyFetch,
    type ProjectType,
  } from "../../../stores/fetchDataStore";
  import { fetched_single } from "../../../stores/fetchDataStore";
  import { undo_store } from "../../../stores/undoStore";
  import { alert_store } from "../../../stores/alertStore";
  import {
    drawing_room_id,
    drawing_room_store,
  } from "../../../stores/drawingRoomStore";
  import { v4 as uuidv4 } from "uuid";
  import { navigate } from "svelte-routing";

  export let handleClear: Function;

  let menuOpen = false;
  let eventState: String;
  let authState: any;
  let loadedDrawing: ProjectType;
  let userInDrawingRoom: boolean;

  const unsubscribe = event_state_store.subscribe((value) => {
    eventState = value;
  });

  const unsubscribe2 = authStore.subscribe((value) => (authState = value.user));

  const unsubscribe3 = fetched_single.subscribe((value) => {
    loadedDrawing = value;
  });

  const unsubscribe4 = drawing_room_store.subscribe((value) => {
    userInDrawingRoom = value;
  });

  onDestroy(() => {
    unsubscribe();
    unsubscribe2();
    unsubscribe3();
    unsubscribe4();
  });

  function handleNew() {
    const undoHistory = get(undo_store).length;
    if (undoHistory === 0 && !get(fetched_single).id) {
      menuOpen = false;
      return;
    }
    if (undoHistory > 0) {
      event_state_store.set("save_confirm_form&new_doodle");
    } else {
      fetched_single.set(EmptyFetch);
      handleClear();
      menuOpen = false;
      alert_store.set("alert:New drawing created!");
    }
  }

  function toggleNavMenu() {
    if (eventState.includes("form") && !eventState.includes("color_palette_edit")) {
      return;
    }
    if (!menuOpen) {
      menuOpen = true;
    } else {
      event_state_store.set("arrow");
      menuOpen = false;
    }
  }

  function handleUnfocus(e: any) {
    if (menuOpen && e.target.id !== "dd-menu") {
      menuOpen = false;
      event_state_store.set("arrow");
    }
  }

  function handleSaveDoodle() {
    menuOpen = false;
    if (get(undo_store).length === 0) {
      alert_store.set("alert:No changes have been made.");
      return;
    }
    if (get(fetched_single).id) {
      CompileAndSaveDoodle("", true);
      undo_store.set([]);
    } else {
      event_state_store.set("saving_new_project_form");
    }
  }

  function clearDoodle() {
    handleClear();
    menuOpen = false;
  }

  function openViewLargePalettes() {
    event_state_store.set("large_view_palettes");
    menuOpen = false;
  }

  function handleViewDoodles() {
    if (get(undo_store).length > 0) {
      event_state_store.set("save_confirm_form&view_doodles_form");
    } else {
      event_state_store.set("view_doodles_form");
    }
    menuOpen = false;
  }

  function handleCreateDrawingRoom() {
    event_state_store.set("confirm_draw_room_form");
    drawing_room_id.set(uuidv4());
    menuOpen = false;
  }

  function openShareMenu() {
    event_state_store.set("share_menu_form");
    menuOpen = false;
  }

  function handleExitDrawingRoom() {
    navigate("/");
  }

  function handleSignIn() {
    signIn();
    menuOpen = false;
  }

  function handleSignOut() {
    signOut();
    menuOpen = false;
  }

  $: {
    if (menuOpen) {
      setTimeout(() => {
        document.addEventListener("click", handleUnfocus);
      }, 1);
    } else {
      document.removeEventListener("click", handleUnfocus);
    }
  }
</script>

<div class="nav-button">
  <button
    class="nav-button-btn-main"
    style:color={menuOpen ? "#535bf2" : ""}
    on:click={toggleNavMenu}><NavButton /></button
  >
</div>

<div class="dropdown-menu" id="dd-menu" class:menuOpen>
  <button class="clear-button nav-button-btn divide-bottom" id="dd-menu"
    >About Us
  </button>
  {#if !authState}
    <button class="clear-button nav-button-btn" id="dd-menu" on:click={clearDoodle}>
      Clear drawing
    </button>
    <button class="clear-button nav-button-btn" id="dd-menu" on:click={handleSignIn}>
      Sign in
    </button>
  {:else}
    <button class="clear-button nav-button-btn" id="dd-menu" on:click={handleNew}>
      New
    </button>
    <button
      class="clear-button nav-button-btn"
      id="dd-menu"
      on:click={handleViewDoodles}
    >
      Open
    </button>
    <button
      class="clear-button nav-button-btn"
      id="dd-menu"
      on:click={handleSaveDoodle}
    >
      Save
    </button>
    {#if loadedDrawing.id}
      <button
        class="clear-button nav-button-btn divide-bottom"
        id="dd-menu"
        on:click={openShareMenu}
      >
        Share
      </button>
    {/if}
    <button class="clear-button nav-button-btn" id="dd-menu" on:click={clearDoodle}>
      Clear Drawing
    </button>
    <button
      class="clear-button nav-button-btn"
      id="dd-menu"
      on:click={openViewLargePalettes}
    >
      View Color Palettes
    </button>
    {#if !userInDrawingRoom}
      <button
        class="clear-button nav-button-btn"
        id="dd-menu"
        on:click={handleCreateDrawingRoom}
      >
        Create Drawing Room
      </button>
    {:else}
      <button
        class="clear-button nav-button-btn"
        id="dd-menu"
        on:click={handleExitDrawingRoom}
      >
        Exit Drawing Room
      </button>
    {/if}
    <button
      class="clear-button nav-button-btn signout"
      id="dd-menu"
      on:click={handleSignOut}>Sign Out</button
    >
  {/if}
</div>

<style>
  button {
    cursor: pointer;
    width: 100%;
  }

  .nav-button {
    position: fixed;
    top: 15px;
    left: 15px;
    height: 44px;
    z-index: 900;
  }

  .nav-button-btn-main {
    justify-content: flex-start;
  }

  .nav-button-btn {
    justify-content: flex-start;
    border-radius: 0px;
  }

  .dropdown-menu {
    position: fixed;
    color: white;
    top: 68px;
    left: 15px;
    font-size: 12pt;
    z-index: 900;
    border-radius: 10px;
    background-color: rgb(31, 35, 39);
    display: none;
    border: 2px solid rgba(255, 255, 255, 0.198);
  }

  .menuOpen {
    display: block;
  }

  .divide-bottom {
    border-radius: 0px;
    border-bottom: 2px solid rgba(255, 255, 255, 0.198);
  }

  .signout {
    padding-top: 25px;
    padding-bottom: 25px;
    border-radius: 0px;
    border-top: 2px solid rgba(255, 255, 255, 0.198);
  }
</style>
