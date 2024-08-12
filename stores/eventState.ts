import { writable } from "svelte/store";

export const event_state_store = writable("arrow")

export const theme_store = writable("dark")

export const locked_store = writable(true)

export const selected_store = writable<any[]>([])

