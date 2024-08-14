<script>
  // @ts-nocheck

  import { onDestroy } from "svelte";
  import {
    UpdateUserPrefs,
    user_prefs_store,
  } from "../../stores/userPrefsStore";
  import Folder from "../graphics/Folder.svelte";
  import Close from "../graphics/Close.svelte";
  import { event_state_store } from "../../stores/eventState";

  let sideBarVisible;
  let closeButton = false;
  let timeoutId;

  const unsubscribe = user_prefs_store.subscribe((value) => {
    sideBarVisible = value.sideBarVisible;
  });

  function handleOpenSideBar() {
    if (sideBarVisible) {
      UpdateUserPrefs({ sideBarVisible: false });
      timeoutId = setTimeout(() => {
        closeButton = false;
      }, 900);
    } else {
      UpdateUserPrefs({ sideBarVisible: true });
      event_state_store.set("arrow");
      timeoutId = setTimeout(() => {
        closeButton = true;
      }, 900);
    }
  }

  onDestroy(() => {
    unsubscribe();
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });
</script>

<div class="side-bar-container" style="left: {sideBarVisible ? '0' : '-316px'}">
  {#if closeButton}
    <button class="left-arrow clear-button" on:click={handleOpenSideBar}>
      <Close />
    </button>
  {:else}
    <button class="left-arrow clear-button" on:click={handleOpenSideBar}>
      <Folder />
    </button>
  {/if}
  <!-- <button class="left-arrow clear-button">
    <ArrowLeft />
  </button> -->
  <div class="interior-div">
    <div class="header">Open Project</div>
    <div class="projects-container">projects will go here...</div>
  </div>
</div>

<style>
  .left-arrow {
    position: absolute;
    top: 0;
    left: 320px;
  }

  button {
    width: 40px;
    height: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0px;
    background-color: transparent;
    color: rgb(255, 255, 255);
    border: 1px solid;
  }
  .side-bar-container {
    position: fixed;
    left: 0;
    top: 52px;
    bottom: 170px;
    width: 300px;
    background-color: white;
    border-radius: 10px;
    z-index: 1000;
    padding: 8px;
    transition: all 1s ease;
  }

  .interior-div {
    background-color: lightgray;
    height: 100%;
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.106);
    /* padding: 5px; */
  }

  .header {
    text-align: center;
    padding: 10px;
    border-bottom: 1px solid black;
  }

  .projects-container {
    padding: 13px;
  }

  /* .sideBarVisible {
    left: 264px;
    color: black;
  } */
</style>
