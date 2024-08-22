<script lang="ts">
  import { onDestroy } from "svelte";
  import { event_state_store } from "../../stores/eventState";
  import Slider from "./Slider.svelte";
  import { authStore } from "../../utils/auth/auth_store";
  import {
    active_color_store,
    active_palette_store,
    editting_tile_store,
  } from "../../stores/paletteStore";
  import type { PaletteType } from "../../stores/paletteStore";
  import SmallViewPalettes from "./menus/SmallViewPalettes.svelte";
  import PaletteInSettings from "./PaletteInSettings.svelte";
  import ColorPickerInSettings from "./ColorPickerInSettings.svelte";

  let eventState: string = "";
  let isVisible: boolean = false;
  let auth: any;
  let activePalette: PaletteType;
  let edittingTile: number | null;
  let activeColor: string;
  let colorPicker: any;

  const unsubcribe = event_state_store.subscribe((value) => {
    eventState = value;
  });

  const unsubcribe2 = authStore.subscribe((value) => {
    auth = value.user;
  });

  const unsubscribe3 = active_palette_store.subscribe((value: PaletteType) => {
    activePalette = value;
  });

  const unsubscribe4 = editting_tile_store.subscribe((value) => {
    edittingTile = value;
  });

  const unsubscribe5 = active_color_store.subscribe((value) => {
    activeColor = value;
  });

  let smallPaletteMenu = false;

  function closeSmallMenu() {
    smallPaletteMenu = false;
  }

  $: onDestroy(() => {
    unsubcribe();
    unsubcribe2();
    unsubscribe3();
    unsubscribe4();
    unsubscribe5();
  });

  $: {
    if (eventState.includes("drawing")) {
      isVisible = true;
    } else {
      isVisible = false;
    }
  }

  function initColorPicker(value: any) {
    colorPicker = value;
    console.log("color picked init");
  }
</script>

<div class="color-bar-3" class:isVisible>
  {#if smallPaletteMenu}
    <SmallViewPalettes {closeSmallMenu} />
  {/if}
  <div class="content-wrapper">
    <div class="slider centered" style="flex-direction: column">
      Stroke
      <div class="centered" style="margin-top: 5px;"><Slider /></div>
    </div>
    <ColorPickerInSettings location={"brush-color-picker"} width={200} />
    <PaletteInSettings />
  </div>
</div>

<style>
  .color-bar-3 {
    position: fixed;
    color: white;
    border-radius: 20px;
    height: 610px;
    background-color: rgb(25, 29, 31);
    left: 15px;
    padding: 20px;
    top: 50%;
    transform: translateY(-50%);
    display: none;
    flex-direction: column;
    border: 2px solid rgba(255, 255, 255, 0.198);
    width: 208px;
  }

  .isVisible {
    display: flex !important;
  }

  .content-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .slider {
    border-bottom: 2px solid rgba(255, 255, 255, 0.198);
    padding-bottom: 10px;
  }
</style>
