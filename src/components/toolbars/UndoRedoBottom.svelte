<script>
  import { HandleRedo } from "../../../stores/redoStore";
  import { HandleUndo } from "../../../stores/undoStore";
  import Redo from "../../graphics/Redo.svelte";
  import Undo from "../../graphics/Undo.svelte";
</script>

<div class="page-turn">
  <button on:click={HandleUndo}> <Undo /> </button>
  <button on:click={HandleRedo}> <Redo /> </button>
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
</style>
