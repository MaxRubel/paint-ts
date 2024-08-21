<script lang="ts">
  import { DeletePalette, GetPalletesOfUser } from "../../../api/palette";
  import {
    active_palette_store,
    initialPalette,
    SetPaletteById,
    SyncLocalPalettes,
  } from "../../../stores/paletteStore";
  import EditIcon from "../../graphics/EditIcon.svelte";
  import TrashCan from "../../graphics/TrashCan.svelte";
  import { alert_store } from "../../../stores/alertStore";
  import { event_state_store } from "../../../stores/eventState";

  export let paletteId: number;

  function handleEditPalette() {
    SetPaletteById(paletteId);
    event_state_store.set("color_palette_edit&drawing");
  }

  function handleDeletePalette() {
    if (window.confirm("Are you sure you want to delete this palette?")) {
      DeletePalette(paletteId).then(() => {
        active_palette_store.set(initialPalette);
        alert_store.set("alert:Palette deleted!");
        SyncLocalPalettes();
      });
    }
  }
</script>

<div class="tiny-palette-choices">
  <button class="clear-button border" on:click={handleEditPalette}>
    <EditIcon />
  </button>
  <button class="clear-button border" on:click={handleDeletePalette}>
    <TrashCan />
  </button>
</div>

<style>
  .tiny-palette-choices {
    position: absolute;
    bottom: 0;
    height: 40px;
    width: calc(100% - 20px);
    display: flex;
    justify-content: flex-end;
    align-items: center;
    background-color: rgba(63, 63, 63, 0.493);
    border-radius: 10px;
  }

  .border {
    border: 1px solid rgba(255, 255, 255, 0.541);
    width: 44px;
    padding: 0px;
    height: 40px;
  }
</style>
