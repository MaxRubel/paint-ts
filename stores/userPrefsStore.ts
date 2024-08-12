import { writable } from "svelte/store";

export const user_prefs_store = writable({ colorBarVisible: false, sideBarVisible: false })

export function UpdateUserPrefs(newValues: Object) {
  user_prefs_store.update(currentValues => {
    return { ...currentValues, ...newValues };
  });
}