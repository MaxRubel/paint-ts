<script lang="ts">
  import { onDestroy } from "svelte";
  import { authStore } from "../utils/auth/auth_store";
  import MainPage from "./components/MainCanvasHub.svelte";
  import { CheckUser } from "../api/user";
  import { event_state_store } from "../stores/eventState";
  import UserRegistrationForm from "./components/forms/UserRegistrationForm.svelte";
  import FormRouter from "./components/forms/FormRouter.svelte";
  import Alert from "./components/alerts/Alert.svelte";
  import DebugMenu from "./components/menus/DebugMenu.svelte";

  let user: any;
  let eventState: string;

  const unsubscribe = authStore.subscribe((value) => (user = value.user));
  const unsubscribe2 = event_state_store.subscribe((value) => (eventState = value));

  onDestroy(() => {
    unsubscribe();
    unsubscribe2();
  });

  $: {
    if (user) {
      CheckUser(user.uid).then((data: any) => {
        if (!data.id) {
          event_state_store.set("needs_registration_form");
        }
      });
    }
  }
</script>

{#if eventState === "needs_registration_form"}
  <UserRegistrationForm />
{/if}
<Alert />
<FormRouter />
<MainPage />
