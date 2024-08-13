<script lang="ts">
  import { onDestroy } from "svelte";
  import { auth_store } from "../utils/auth/auth_store";
  import MainPage from "./components/MainPage.svelte";

  let userAuth: any;

  const unsubscribe = auth_store.subscribe((value) => {
    userAuth = value;
  });

  onDestroy(unsubscribe);

  $: {
    if (userAuth.user) {
      console.log("checking for user in db...");
    }
  }
</script>

<MainPage />
