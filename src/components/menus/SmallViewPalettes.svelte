<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    active_palette_store,
    user_palettes_store,
  } from "../../../stores/paletteStore";
  import { GetPalletesOfUser } from "../../../api/palette";
  import { authStore } from "../../../utils/auth/auth_store";
  import { get } from "svelte/store";
  import type { PaletteType } from "../../../stores/paletteStore";

  export let closeSmallMenu: Function;

  let userPalettes: PaletteType[];

  const unsubcribe = user_palettes_store.subscribe((value: PaletteType[]) => {
    userPalettes = value;
  });

  function loadPalette(palette: PaletteType) {
    active_palette_store.set(palette);
    closeSmallMenu();
  }

  function handleUnfocus(e: any) {
    if (!e.target.id.includes("small-palette-menu")) {
      closeSmallMenu();
      console.log(e.target.id);
    }
  }

  onMount(() => {
    const userId = get(authStore).user.id;
    //@ts-ignore
    GetPalletesOfUser(userId).then((data: PaletteType[]) => {
      user_palettes_store.set(data);
    });
    document.addEventListener("pointerdown", handleUnfocus);
  });

  onDestroy(() => {
    unsubcribe();
    document.removeEventListener("pointerdown", handleUnfocus);
  });
</script>

<div class="cool small-view-palettes" id="small-palette-menu" style="width: 185px">
  {#each userPalettes as palette (palette.id)}
    <button
      id="small-palette-menu-bttn"
      class="clear-button small"
      on:click={() => {
        loadPalette(palette);
      }}>{palette.name}</button
    >
  {/each}
</div>

<style>
  .small-view-palettes {
    z-index: 1004;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 249px;
    height: 400px;
    overflow-y: auto;
    padding: 0px;
  }

  .small {
    width: 100%;
    justify-content: flex-start;
  }
</style>
