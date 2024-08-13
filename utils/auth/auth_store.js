import { writable } from "svelte/store";

export const auth_store = writable({
    user: null,
    user_db: null
})