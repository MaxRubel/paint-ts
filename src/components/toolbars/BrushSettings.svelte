<script lang="ts">
  import { event_state_store } from "../../../stores/eventState";
  import Slider from "./Slider.svelte";
  import { authStore } from "../../../utils/auth/auth_store";
  import {
    active_color_store,
    active_palette_store,
    editting_tile_store,
  } from "../../../stores/paletteStore";
  import type { PaletteType } from "../../../stores/paletteStore";
  import PaletteInSettings from "./PaletteInSettings.svelte";
  import ColorPickerInSettings from "./ColorPickerInSettings.svelte";
  import { side_bar_hidden_store } from "../../../stores/userPrefsStore";
  import SideBarCollapseButton from "./SideBarCollapseButton.svelte";

  let eventState: string = "";
  let isVisible: boolean = false;
  let auth: any;
  let activePalette: PaletteType;
  let edittingTile: number | null;
  let activeColor: string;
  let sidebarHidden: boolean;

  $: eventState = $event_state_store;
  $: auth = $authStore.user;
  $: activePalette = $active_palette_store;
  $: edittingTile = $editting_tile_store;
  $: activeColor = $active_color_store;
  $: sidebarHidden = $side_bar_hidden_store;

  $: {
    if (eventState.includes("drawing")) {
      isVisible = true;
    } else {
      isVisible = false;
    }
  }

  let left: number;
  $: {
    if (sidebarHidden) {
      left = -254;
    } else {
      left = 15;
    }
  }
</script>

<div class="color-bar-3" class:isVisible style="left: {left}px">
  <div class="sidebutton-container">
    <SideBarCollapseButton {sidebarHidden} />
  </div>
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
    height: 620px;
    background-color: rgb(25, 29, 31);
    padding: 20px;
    top: 70px;
    display: none;
    flex-direction: column;
    border: 2px solid rgba(255, 255, 255, 0.198);
    width: 208px;
    transition: all 0.8s ease;
  }

  .isVisible {
    display: flex;
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

  .sidebutton-container {
    width: 100%;
    height: 44px;
    color: White;
  }
</style>
