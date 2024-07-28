import { writable } from "svelte/store";

export const event_state_store = writable("drawing")

export const theme_store = writable("dark")