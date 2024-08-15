<script lang="ts">
  import { onDestroy } from "svelte";
  import { event_state_store } from "../../../stores/eventState";
  import SavingNewProjectForm from "./SavingNewProjectForm.svelte";
  import ViewDoodles from "./ViewDoodles.svelte";

  let eventState: string;

  const unsubscribe = event_state_store.subscribe((value) => (eventState = value));

  onDestroy(() => {
    unsubscribe();
  });
</script>

{#if eventState === "saving_new_project_form"}
  <SavingNewProjectForm />
{/if}
{#if eventState === "view_doodles_form"}
  <ViewDoodles />
{/if}
