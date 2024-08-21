<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    SyncLocalPalettes,
    user_palettes_store,
    type PaletteType,
  } from "../../../stores/paletteStore";
  import { get } from "svelte/store";
  import { GetPalletesOfUser } from "../../../api/palette";
  import { authStore } from "../../../utils/auth/auth_store";
  import SmallPalette from "../SmallPalette.svelte";
  import Close from "../../graphics/Close.svelte";
  import { event_state_store } from "../../../stores/eventState";

  let userPalettes: PaletteType[] = [];

  function handleClose() {
    event_state_store.set("arrow");
  }

  const unsubscribe = user_palettes_store.subscribe((value) => {
    userPalettes = value;
  });

  onMount(() => {
    userPalettes = get(user_palettes_store);
    if (userPalettes.length === 0) {
      SyncLocalPalettes();
    }
  });

  onDestroy(unsubscribe);
</script>

<div class="large-open-palette-window cool">
  <div class="centered fullwidth top-row">
    <div />
    <div class="centered">
      <h3>Your Palettes</h3>
    </div>
    <div class="top-right">
      <button class="clear-button close-button" on:click={handleClose}>
        <Close />
      </button>
    </div>
  </div>
  <div class="palettes-container">
    {#each userPalettes as palette (palette.id)}
      <SmallPalette {palette} />
    {/each}
  </div>
</div>

<style>
  .large-open-palette-window {
    z-index: 899;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 560px;
    width: 800px;
    overflow-y: auto;
    padding: 15px;
  }
  .fullwidth {
    width: 100%;
    border-bottom: 1px solid white;
  }

  .top-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }

  .palettes-container {
    height: 100%;
    padding: 10px;
    width: calc(100% - 20px);
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 10px;
  }

  .top-right {
    display: flex;
    justify-content: flex-end;
  }
</style>
