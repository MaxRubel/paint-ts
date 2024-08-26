<script lang="ts">
  import { onMount } from "svelte";
  import { InitWShandshake } from "../../utils/initDrawingRoomSocket";

  let peerIds: string[] = [];
  let myPublicId: string;

  function addClientIds(array: string[]) {
    for (let i = 0; i < array.length; i++) {
      if (array[i] === myPublicId) {
        continue;
      } else {
        peerIds.push(array[i]);
      }
    }
  }

  function parseMessage(e: any) {
    const { data } = e;
    const parsed = JSON.parse(data);
    switch (parsed.type) {
      case "new_client_ids":
        addClientIds(parsed.data.clientIds);
    }
  }

  onMount(() => {
    const { ws, userId } = InitWShandshake();
    myPublicId = userId;
    ws.onmessage = (e) => {
      parseMessage(e);
    };
  });
</script>
