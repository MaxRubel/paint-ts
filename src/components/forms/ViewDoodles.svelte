<script lang="ts">
  import { onMount } from "svelte";
  import { GetDoodlesOfUser } from "../../../api/doodles";
  import { get } from "svelte/store";
  import { authStore } from "../../../utils/auth/auth_store";
  import Close from "../../graphics/Close.svelte";
  import { event_state_store } from "../../../stores/eventState";
  import { FetchAndLoadDoodle } from "../../../stores/fetchDataStore";

  let doodlesData: any = {
    yourDoodles: [],
    theirDoodles: [],
  };

  function handleClose() {
    event_state_store.set("arrow");
  }

  function handleOpenDoodle(id: number) {
    FetchAndLoadDoodle(id);
  }

  onMount(() => {
    const uid = get(authStore).user.id;
    GetDoodlesOfUser(uid).then((data) => {
      doodlesData = data;
    });
  });
</script>

<div class="fixed-center cool view-doodles">
  <div class="row">
    <div id="empty-grid-spot" />
    <div class="centered">
      <h3 class="centered">Open</h3>
    </div>
    <div class="close-button centered">
      <button class="clear-button closer centered" on:click={handleClose}>
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
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .view-doodles {
    z-index: 1003;
    min-height: 400px;
    width: 700px;
  }

  .doodle-button {
    width: 100%;
  }

  .row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
    margin-bottom: 20px;
    width: 100%;
  }

  .close-button {
    transform: translateY(-10px);
    display: flex;
    justify-content: flex-end;
  }

  .closer {
    width: 44px;
    padding: 0px;
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
</style>
