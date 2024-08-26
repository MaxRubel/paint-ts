<script lang="ts">
  import { onMount } from "svelte";
  import { InitWShandshake } from "../../utils/initDrawingRoomSocket";

  onMount(() => {
    const ws = InitWShandshake();
    ws.onmessage = (e) => {
      console.log(e.data);
    };
  });
</script>
