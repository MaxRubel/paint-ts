<script lang="ts">
  import { side_bar_hidden_store } from "../../../stores/userPrefsStore";
  import ArrowLeft from "../../graphics/ArrowLeft.svelte";

  export let sidebarHidden: Boolean;

  function toggleSideBar() {
    if (sidebarHidden) {
      side_bar_hidden_store.set(false);
    } else {
      side_bar_hidden_store.set(true);
    }
  }
</script>

<button
  class="move"
  on:click={toggleSideBar}
  style="left: {sidebarHidden ? '270px' : '16px'}"
>
  <ArrowLeft {sidebarHidden} />
</button>

<style>
  .move {
    position: absolute;
    height: 30px;
    width: 40px;
    padding: 0px;
    top: 15px;
    transition: left 0.8s ease;
    color: rgb(255, 53, 235);
  }
</style>
