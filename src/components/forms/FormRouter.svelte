<script lang="ts">
  import { onDestroy } from "svelte";
  import { event_state_store } from "../../../stores/eventState";
  import SavingNewProjectForm from "./SavingNewProjectForm.svelte";
  import ViewDoodles from "../menus/OpenDoodleMenu.svelte";
  import SaveConfirmForm from "./SaveConfirmForm.svelte";
  import ColorPaletteForm from "./ColorPaletteForm.svelte";
  import LargeViewPalettes from "../menus/LargeViewPalettes.svelte";
  import ShareMenu from "../menus/ShareMenu.svelte";
  import ConfirmDrawingRoomForm from "./ConfirmDrawingRoomForm.svelte";
  import ConfirmJoinDrawingRoom from "./ConfirmJoinDrawingRoom.svelte";

  let eventState: string;

  const unsubscribe = event_state_store.subscribe((value) => (eventState = value));

  onDestroy(() => {
    unsubscribe();
  });
</script>

{#if eventState.includes("saving_new_project_form")}
  <SavingNewProjectForm />
{/if}
{#if eventState === "view_doodles_form"}
  <ViewDoodles />
{/if}
{#if eventState.includes("save_confirm_form")}
  <SaveConfirmForm />
{/if}
{#if eventState.includes("color_palette_edit_form")}
  <ColorPaletteForm />
{/if}
{#if eventState.includes("large_view_palettes")}
  <LargeViewPalettes />
{/if}
{#if eventState.includes("share_menu_form")}
  <ShareMenu />
{/if}
{#if eventState === "confirm_draw_room_form"}
  <ConfirmDrawingRoomForm />
{/if}
{#if eventState === "confirm_join_drawing_room_form"}
  <ConfirmJoinDrawingRoom />
{/if}
