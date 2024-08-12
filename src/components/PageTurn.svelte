<script>
  import { HandleUndo } from "../../stores/undoStore";
  import Redo from "../graphics/Redo.svelte";
  import Undo from "../graphics/Undo.svelte";
</script>

<div class="page-turn">
  <button on:click={HandleUndo}> <Undo /> </button>
  <button> <Redo /> </button>
</div>

<style>
  button {
    height: 44px;
    width: 60px;
    color: aliceblue;
    background-color: rgba(0, 0, 0, 0.269);
    /* background-color: #9096ff48; */
  }
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
