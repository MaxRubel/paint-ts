<script lang="ts">
  import { HandleRedo } from "../../../stores/redoStore";
  import { HandleUndo } from "../../../stores/undoStore";
  import Redo from "../../graphics/Redo.svelte";
  import Undo from "../../graphics/Undo.svelte";
  import { redo_store } from "../../../stores/redoStore";
  import { onDestroy } from "svelte";

  let canRedo: boolean;

  const unsubcribe = redo_store.subscribe((value) => {
    if (value.length > 0) {
      canRedo = true;
    } else {
      canRedo = false;
    }
  });

  onDestroy(unsubcribe);
</script>

<div class="page-turn">
  <button on:click={HandleUndo}> <Undo /> </button>
  <button on:click={HandleRedo} class="redo" class:canRedo> <Redo /> </button>
</div>

<style>
  .page-turn {
    background-color: transparent;
    position: fixed;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    padding: 5px 25px;
    border-radius: 9px;
  }

  .redo {
    color: rgb(86, 86, 86);
  }

  .canRedo {
    color: white;
  }
</style>
