<script>
  import { onMount } from "svelte";

  onMount(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/signalling");

    ws.onmessage = (e) => {
      console.log(e.data);
    };
  });
</script>
