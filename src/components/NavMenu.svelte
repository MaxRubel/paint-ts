<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import NavButton from "../graphics/NavButton.svelte";
  import { event_state_store } from "../../stores/eventState";
  import { signIn, signOut } from "../../utils/auth/firebase";
  import { authStore } from "../../utils/auth/auth_store";

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

  function toggleNavMenu() {
    if (!menuOpen) {
      event_state_store.set("nav-menu");
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

  $: {
    if (eventState !== "nav-menu") {
      menuOpen = false;
    }
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
  <button class="clear-button">About Us</button>
  {#if !authState}
    <button class="clear-button" on:click={signIn}>Sign in</button>
  {/if}
  {#if authState}
    <button class="clear-button">Open Project</button>
    <button class="clear-button">Save Project</button>
    <button class="clear-button">Color Palettes</button>
    <button class="clear-button">Share</button>
    <button class="clear-button" on:click={signOut}>Sign Out</button>
  {/if}
</div>

<style>
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
    background-color: rgba(0, 0, 0, 0.266);
    display: none;
    border: 2px solid rgba(255, 255, 255, 0.198);
  }

  .menuOpen {
    display: block;
  }
</style>
