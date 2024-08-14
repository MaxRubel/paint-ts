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
    if (resp.id) {
      event_state_store.set("arrow");
    }
  }

  function handleCancel() {
    signOut().then(() => {
      event_state_store.set("arrow");
    });
  }
</script>

<div class="overlay" />
<form class="user-registration-form" on:submit={handleSubmit}>
  <h2>Welcome to GroupDoodles!</h2>
  <p>We're happy to have you!</p>
  <p>Please choose a username:</p>
  <input
    type="text"
    class="username_input"
    placeholder="coolDude25"
    bind:value={username}
  />
  <div class="top">
    <button type="submit" class="submit-button"> Submit</button>
    <button class="submit-button" on:click={handleCancel}>Cancel</button>
  </div>
  <!-- Add your form fields here -->
</form>

<style>
  .user-registration-form {
    z-index: 1002;
    position: fixed;

    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    height: 18rem;
    width: 30rem;
    min-width: 350px;
    background: white;
    color: black;
    padding: 30px;
    border-radius: 8px;
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.516);
    z-index: 1001;
  }

  .username_input {
    height: 36px;
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
