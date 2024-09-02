<script lang="ts">
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
    i_am_hosting,
  } from "../../../stores/drawingRoomStore";
  import { v4 as uuidv4 } from "uuid";
  import { navigate } from "svelte-routing";
  import Folder from "../../graphics/NavMenu/Folder.svelte";
  import SaveIcon from "../../graphics/NavMenu/SaveIcon.svelte";
  import Palette from "../../graphics/NavMenu/Palette.svelte";
  import StarsIcon from "../../graphics/NavMenu/StarsIcon.svelte";
  import PeopleIcon from "../../graphics/NavMenu/PeopleIcon.svelte";
  import NewFileIcon from "../../graphics/NavMenu/NewFileIcon.svelte";
  import ShareIcon from "../../graphics/NavMenu/ShareIcon.svelte";

  export let handleClear: Function;

  let menuOpen = false;
  let eventState: String;
  let authState: any;
  let loadedDrawing: ProjectType;
  let userInDrawingRoom: boolean;

  $: eventState = $event_state_store;
  $: authState = $authStore.user;
  $: loadedDrawing = $fetched_single;
  $: userInDrawingRoom = $drawing_room_store;

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
    menuOpen = false;
    if (window.confirm("Are you sure you want to clear this drawing?")) {
      handleClear();
    }
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
    drawing_room_store.set(false);
    i_am_hosting.set(false);
    navigate("/");
    menuOpen = false;
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
      16;
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
  <button class="clear-button nav-button-btn divide-bottom" id="dd-menu">
    About Us
  </button>
  {#if !authState}
    <button class="clear-button nav-button-btn" id="dd-menu" on:click={clearDoodle}>
      Clear drawing
    </button>
    <button class="clear-button nav-button-btn" id="dd-menu" on:click={handleSignIn}>
      Sign in16
    </button>
  {:else}
    <button class="clear-button nav-button-btn" id="dd-menu" on:click={clearDoodle}>
      <StarsIcon /> Clear Drawing
    </button>
    <button class="clear-button nav-button-btn" id="dd-menu" on:click={handleNew}>
      <NewFileIcon /> New
    </button>
    <button
      class="clear-button nav-button-btn"
      id="dd-menu"
      on:click={handleViewDoodles}
    >
      <Folder /> Open
    </button>
    <button
      class="clear-button nav-button-btn"
      id="dd-menu"
      on:click={handleSaveDoodle}
    >
      <SaveIcon /> Save
    </button>
    {#if loadedDrawing.id}
      <button
        class="clear-button nav-button-btn"
        id="dd-menu"
        on:click={openShareMenu}
      >
        <ShareIcon /> Share Drawing
      </button>
    {/if}
    <button
      class="clear-button nav-button-btn divide-bottom"
      id="dd-menu"
      on:click={openViewLargePalettes}
    >
      <Palette /> View Color Palettes
    </button>
    {#if !userInDrawingRoom}
      <button
        class="clear-button nav-button-btn large"
        id="dd-menu"
        on:click={handleCreateDrawingRoom}
      >
        <PeopleIcon />Create Drawing Room
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
    display: flex;
    gap: 8px;
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

  .large {
    padding-top: 25px;
    padding-bottom: 25px;
    border-radius: 0px;
  }

  .signout {
    padding-top: 25px;
    padding-bottom: 25px;
    border-radius: 0px;
    border-top: 2px solid rgba(255, 255, 255, 0.198);
  }
</style>
