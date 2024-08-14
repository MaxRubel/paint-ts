<script lang="ts">
  import { onDestroy } from "svelte";
  import { event_state_store } from "../../../stores/eventState";
  import SavingNewProjectForm from "./SavingNewProjectForm.svelte";

  let eventState: string;

  const unsubscribe2 = event_state_store.subscribe(
    (value) => (eventState = value),
  );

  onDestroy(() => {
    unsubscribe2();
  });
</script>

{#if eventState === "saving_new_project_form"}
  <SavingNewProjectForm />
{/if}
