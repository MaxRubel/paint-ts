<script lang="ts">
  import { onDestroy } from "svelte";
  import NavButton from "../../graphics/NavButton.svelte";
  import { event_state_store } from "../../../stores/eventState";
  import { signIn, signOut } from "../../../utils/auth/firebase";
  import { authStore } from "../../../utils/auth/auth_store";
  import { get } from "svelte/store";
  import { CompileAndSaveDoodle, EmptyFetch } from "../../../stores/fetchDataStore";
  import { fetched_single } from "../../../stores/fetchDataStore";
  import { undo_store } from "../../../stores/undoStore";
  import { alert_store } from "../../../stores/alertStore";

  export let handleClear: Function;

  let menuOpen = false;
  let eventState: String;
  let authState: any;

  const unsubscribe = event_state_store.subscribe((value) => {
    eventState = value;
  });

  const unsubscribe2 = authStore.subscribe((value) => (authState = value.user));

  onDestroy(() => {
    unsubscribe();
    unsubscribe2();
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
      alert_store.set("alert:New doodle created!");
    }
  }

  function toggleNavMenu() {
    if (eventState.includes("form")) {
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

  function handleViewDoodles() {
    if (get(undo_store).length > 0) {
      event_state_store.set("save_confirm_form&view_doodles_form");
    } else {
      event_state_store.set("view_doodles_form");
    }
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
    } else {
      document.removeEventListener("click", handleUnfocus);
    }
  }
</script>

<div class="nav-button">
  <button on:click={toggleNavMenu}><NavButton /></button>
</div>

<div class="dropdown-menu" id="dd-menu" class:menuOpen>
  <button class="clear-button" id="dd-menu">About Us</button>
  {#if !authState}
    <button class="clear-button" id="dd-menu" on:click={clearDoodle}>Clear doodle</button>
    <button class="clear-button" id="dd-menu" on:click={handleSignIn}>Sign in</button>
  {:else}
    <button class="clear-button" id="dd-menu" on:click={handleNew}>New</button>
    <button class="clear-button" id="dd-menu" on:click={handleViewDoodles}>Open</button>
    <button class="clear-button" id="dd-menu" on:click={handleSaveDoodle}>Save</button>
    <button class="clear-button" id="dd-menu">Share</button>
    <button class="clear-button" id="dd-menu" on:click={clearDoodle}>Clear Doodle</button>
    <button class="clear-button" id="dd-menu">View Color Palettes</button>
    <button class="clear-button" id="dd-menu" on:click={handleSignOut}>Sign Out</button>
  {/if}
</div>

<style>
  button {
    cursor: pointer;
  }

  .nav-button {
    position: fixed;
    top: 15px;
    left: 15px;
    height: 44px;
    width: 44px;
    z-index: 900;
  }

  .dropdown-menu {
    position: fixed;
    color: white;
    top: 70px;
    left: 15px;
    font-size: 12pt;
    z-index: 900;
    border-radius: 10px;
    background-color: rgb(31, 38, 43);
    display: none;
    border: 2px solid rgba(255, 255, 255, 0.198);
  }

  .menuOpen {
    display: block;
  }
</style>
