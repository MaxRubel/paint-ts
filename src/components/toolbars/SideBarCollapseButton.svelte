<script lang="ts">
  import { side_bar_hidden_store } from "../../../stores/userPrefsStore";
  import ArrowLeft from "../../graphics/ArrowLeft.svelte";
  import { event_state_store } from "../../../stores/eventState";

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
  style="left: {sidebarHidden ? '270px' : '260px'}"
  style:height={$event_state_store === "erasing" ? "120px" : "630px"}
>
  <ArrowLeft {sidebarHidden} />
</button>

<style>
  .move {
    position: absolute;
    height: 630px;
    width: 44px;
    padding: 0px;
    top: 15px;
    transition: left 0.8s ease;
    color: white;
  }
</style>
