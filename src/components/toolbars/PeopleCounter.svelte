<script lang="ts">
  import { onDestroy } from "svelte";
  import { peerStates } from "../../../utils/webRTCNegotiate";
  import PeopleIcon from "../../graphics/PeopleIcon.svelte";

  let amount = 0;

  const unsubscribe = peerStates.subscribe((peerStates) => {
    amount = 0;
    for (const status of Object.values(peerStates)) {
      if (status) {
        amount = amount + 1;
      }
    }
  });

  onDestroy(() => {
    unsubscribe();
  });
</script>

<button class="people-counter">
  <div><PeopleIcon /></div>
  <div>{amount} / 4</div>
</button>

<style>
  .people-counter {
    display: flex;
    gap: 10px;
    justify-content: center;
    color: white;
    z-index: 800;
    position: fixed;
    top: 15px;
    right: 15px;
    width: auto;
    pointer-events: none;
    /* background-color: rgb(56, 55, 55); */
    /* padding: 8px 20px; */
    /* border-radius: 10px; */
  }
</style>
