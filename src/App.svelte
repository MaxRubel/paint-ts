<script lang="ts">
  import { onDestroy } from "svelte";
  import { authStore } from "../utils/auth/auth_store";
  import MainPage from "./components/MainPage.svelte";
  import { CheckUser } from "../api/user";
  import { event_state_store } from "../stores/eventState";

  let user: any;

  const unsubscribe = authStore.subscribe((value) => (user = value.user));
  onDestroy(unsubscribe);

  $: {
    CheckUser(user.uid).then((data: any) => {
      if (!data.valid) event_state_store.set("needs_registration");
    });
  }
</script>

<MainPage />
