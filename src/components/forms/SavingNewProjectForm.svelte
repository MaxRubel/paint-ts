<script lang="ts">
  import SaveIcon from "../../graphics/SaveIcon.svelte";
  import { event_state_store } from "../../../stores/eventState";
  import { CompileAndSaveDoodle } from "../../../stores/fetchDataStore";
  import { get } from "svelte/store";

  let name: string = "";
  let nextForm = "";

  function handleCancel() {
    event_state_store.set("arrow");
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (get(event_state_store).includes("view_doodles_form_after")) {
      nextForm = "view_doodles_form";
    }

    await CompileAndSaveDoodle(name, false);

    if (nextForm === "view_doodles_form") {
      event_state_store.set(nextForm);
    }
  }
</script>

<div class="overlay" />
<form class="new-project-form cool" on:submit={handleSubmit}>
  <div class="row">
    <SaveIcon />
    <h3>Save Your Project</h3>
  </div>
  <div class="lower-half">
    <div class="input-label">Name this doodle</div>
    <input type="text" placeholder="Enter doodle name" bind:value={name} />
  </div>
  <div class="button-row">
    <button type="submit">Submit</button>
    <button type="button" on:click={handleCancel}>Cancel</button>
  </div>
</form>

<style>
  .new-project-form {
    z-index: 1003;
    position: fixed;
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    height: 400px;
  }

  h3 {
    margin-bottom: 20px;
  }

  .input-label {
    margin-bottom: 10px;
  }

  input {
    width: 80%;
    padding: 10px;
    margin-top: 10px;
    border-radius: 5px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .lower-half {
    margin-top: 50px;
    width: 90%;
    height: 50%;
  }

  button {
    width: auto;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
  }
</style>
