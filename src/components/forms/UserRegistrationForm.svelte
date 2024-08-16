<script lang="ts">
  import { signOut } from "../../../utils/auth/firebase";
  import { get } from "svelte/store";
  import { authStore } from "../../../utils/auth/auth_store";
  import { CheckUser, RegisterUser } from "../../../api/user";
  import { event_state_store } from "../../../stores/eventState";

  let username: string;

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const { email, uid } = get(authStore).user;
    await RegisterUser({ email, uid, username });

    const resp: any = await CheckUser(uid);
    authStore.setUser(resp);

    if (resp.id) {
      event_state_store.set(`alert: Welcome ${username}!`);
    }
  }

  function handleCancel() {
    signOut().then(() => {
      event_state_store.set("arrow");
    });
  }
</script>

<div class="overlay" />
<form class="user-registration-form cool fixed-center" on:submit={handleSubmit}>
  <h2>Welcome to GroupDoodles!</h2>
  <p>We're happy to have you!</p>
  <p>Please choose a nickname:</p>
  <input type="text" class="username_input" placeholder="coolDude25" bind:value={username} />
  <div class="top">
    <button type="submit" class="submit-button"> Submit</button>
    <button type="button" class="submit-button" on:click={handleCancel}>Cancel</button>
  </div>
</form>

<style>
  .user-registration-form {
    z-index: 1002;
  }

  .username_input {
    height: 25px;
    width: 200px;
  }

  .top {
    margin-top: 40px;
  }

  .submit-button {
    width: auto;
    background-color: black;
  }
</style>
