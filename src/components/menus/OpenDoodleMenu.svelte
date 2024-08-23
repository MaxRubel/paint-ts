<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { DeleteDoodle } from "../../../api/doodles";
  import Close from "../../graphics/Close.svelte";
  import { event_state_store } from "../../../stores/eventState";
  import {
    FetchAndLoadDoodle,
    fetched_all,
    fetched_single,
    GetAllUserDoodles,
  } from "../../../stores/fetchDataStore";
  import TrashCan from "../../graphics/TrashCan.svelte";
  import { get } from "svelte/store";
  import { ClearEverything } from "../../../stores/canvasStore";

  let doodlesData: any;

  const unsubcribe = fetched_all.subscribe((value) => {
    doodlesData = value;
  });

  function handleClose() {
    event_state_store.set("arrow");
  }

  function handleOpenDoodle(id: number) {
    FetchAndLoadDoodle(id);
  }

  function handleDelete(id: number) {
    if (window.confirm("Are you sure you want to delete this doodle?")) {
      DeleteDoodle(id).then(() => {
        GetAllUserDoodles();
        if (id === get(fetched_single).id) {
          ClearEverything();
        }
      });
    }
  }

  onMount(() => {
    GetAllUserDoodles();
  });

  onDestroy(() => {
    unsubcribe();
  });
</script>

<div class="overlay" />
<div class="fixed-center cool view-doodles">
  <div class="row">
    <div id="empty-grid-spot" />
    <div class="centered">
      <h3 class="centered">Open</h3>
    </div>
    <div class="top-right">
      <button class="clear-button closer centered moved" on:click={handleClose}>
        <Close />
      </button>
    </div>
  </div>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Created On</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        {#each doodlesData.yourDoodles as doodle (doodle.id)}
          <tr>
            <td>
              <button
                class="clear-button doodle-button"
                on:click={() => {
                  handleOpenDoodle(doodle.id);
                }}
              >
                {doodle.name}
              </button>
            </td>
            <td>{doodle.date_created}</td>
            <td style="width: 80px">
              <button
                class="clear-button trash centered"
                on:click={() => {
                  handleDelete(doodle.id);
                }}
              >
                <TrashCan />
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  h3 {
    margin-top: 0px;
  }
  .view-doodles {
    z-index: 1003;
    /* min-height: 400px;
    /* max-height: 900px; */
    height: 75vh;
    overflow-y: auto;
    width: 700px;
    top: 70px;
  }

  .trash {
    width: 50px;
    padding: 0px;
  }

  .doodle-button {
    width: 100%;
    justify-content: flex-start;
    border-radius: 0px;
  }

  .row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
    margin-bottom: 20px;
    width: 100%;
  }

  .closer {
    width: 44px;
    padding: 0px;
  }

  .top-right {
    display: flex;
    justify-content: flex-end;
  }

  .table-container {
    width: 100%;
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }
  th {
    padding: 8px;
  }
  th,
  td {
    border-bottom: 1px solid #ddd;
    text-align: left;
  }

  th {
    background-color: #f2f2f2;
    color: black;
  }

  .moved {
    transform: translate(10px, -10px);
    width: 50px;
  }
</style>
