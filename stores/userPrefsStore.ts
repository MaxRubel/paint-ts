import { writable } from "svelte/store";

export const user_prefs_store = writable({ colorBarVisible: false, sideBarVisible: false })

export const side_bar_hidden_store = writable(true)

export function UpdateUserPrefs(newValues: Object) {
  user_prefs_store.update(currentValues => {
    return { ...currentValues, ...newValues };
  });
}