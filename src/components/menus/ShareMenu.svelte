<script lang="ts">
  import { get } from "svelte/store";
  import Close from "../../graphics/Close.svelte";
  import { fetched_single, SyncDoodle } from "../../../stores/fetchDataStore";
  import { alert_store } from "../../../stores/alertStore";
  import { event_state_store } from "../../../stores/eventState";
  import { RemoveCollabFromDoodle, ShareDoodle } from "../../../api/doodles";
  import { onDestroy } from "svelte";
  import { authStore } from "../../../utils/auth/auth_store";
  import TrashCan from "../../graphics/TrashCan.svelte";

  let email = "";
  let collaborators: any[] = [];
  const doodleId = get(fetched_single).id;

  const unsubcribe = fetched_single.subscribe((value) => {
    collaborators = value.collaborators;
  });

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const doodleId = get(fetched_single).id;
    if (!doodleId) {
      alert_store.set("alert:Please save your doodle before sharing");
      return;
    }

    const payload = {
      doodle_id: get(fetched_single).id,
      email,
    };

    ShareDoodle(payload).then((data: any) => {
      if (data.error) {
        switch (data.error) {
          case "This collaborator is already connected":
            alert_store.set(
              "alert:Oops! This user is already connected to this drawing",
            );
            break;
          case "User does not exist":
            alert_store.set("alert:Oops! This user is not registered");
            break;
        }
      } else if (data.success) {
        alert_store.set("alert:Drawing shared succesfully!");
        email = "";
        SyncDoodle();
      }
    });
  }

  function handleClose() {
    event_state_store.set("arrow");
  }

  function handleRemove(id: number) {
    const payload = {
      user_id: id,
      doodle_id: doodleId,
    };
    RemoveCollabFromDoodle(payload).then(() => {
      SyncDoodle();
    });
  }

  onDestroy(() => {
    unsubcribe();
  });
</script>

<div class="overlay" />
<div class="cool share-menu">
  <div class="top-row">
    <div />
    <div><h3 class="less">Share</h3></div>
    <div class="top-right">
      <button class="clear-button close-button" on:click={handleClose}>
        <Close />
      </button>
    </div>
  </div>
  <form action="#" class="share-form" on:submit={handleSubmit}>
    <div>User's Email:</div>
    <div>
      <input
        type="email"
        class="input"
        bind:value={email}
        placeholder="CoolUser@email.com"
        required
      />
    </div>
    <div class="centered"><button class="submit" type="submit">Share</button></div>
  </form>
  <div class="collabs-container">
    <div class="centered second-row">
      <h3>Collaborators</h3>
    </div>
    <div class="sub-container">
      {#if collaborators.length === 0}
        You haven't shared this project with anyone yet...
      {:else}
        <table class="collaborator-table">
          <thead>
            <tr>
              <th class="big">Username</th>
              <th class="big">Email</th>
              {#if get(fetched_single).owner.id === get(authStore).user.id}
                <th class="big">Remove</th>
              {/if}
            </tr>
          </thead>
          <tbody>
            {#each collaborators as collab}
              <tr>
                <td class="big">GentleGiant36</td>
                <td class="big">{collab.email}</td>
                {#if get(fetched_single).owner.id === get(authStore).user.id}
                  <td class="big">
                    <button
                      class="clear-button small"
                      on:click={() => {
                        handleRemove(collab.id);
                      }}
                    >
                      <TrashCan />
                    </button>
                  </td>
                {/if}
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </div>
</div>

<style>
  .share-menu {
    z-index: 1002;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 560px;
    width: 800px;
    overflow-y: auto;
    padding: 15px;
  }

  .top-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    width: 100%;
    text-align: center;
    border-bottom: 1px solid white;
  }

  .top-right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .share-form {
    display: flex;
    width: 100%;
    justify-content: space-evenly;
    align-items: center;
    margin-top: 15px;
  }

  .input {
    width: 250px;
    margin: 0px;
  }

  .submit {
    width: auto;
    background-color: #535bf2;
  }

  .collabs-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .second-row {
    border-bottom: 1px solid white;
    width: 100%;
  }

  .sub-container {
    display: flex;
    justify-content: center;
    padding: 20px;
    width: calc(100% - 20px);
    height: 310px;
    overflow-y: auto;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    line-height: 50px;
  }
  th {
    padding: 8px;
  }
  th,
  td {
    border-bottom: 1px solid #ddd;
    text-align: left;
    line-height: 50px;
    height: 50px !important;
  }

  th {
    background-color: #f2f2f2;
    color: black;
  }

  tr {
    height: 50px;
    line-height: 50px;
  }

  .big {
    width: 200px;
    height: 30px;
  }

  .small {
    width: 50px;
    padding: 0px;
  }
</style>
