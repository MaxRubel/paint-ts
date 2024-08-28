import { get, writable } from "svelte/store";

function createAuthStore() {
  const storedUser = localStorage.getItem("user");
  const initialUser = storedUser ? JSON.parse(storedUser) : null;

  const { subscribe, set, update } = writable({ user: initialUser });

  return {
    subscribe,
    setUser: (newUserData: Partial<any>) => {
      update((state) => {
        const updatedUser = state.user
          ? { ...state.user, ...newUserData }
          : newUserData;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return { ...state, user: updatedUser };
      });
    },
    clearUser: () => {
      set({ user: initialUser });
      localStorage.removeItem("user");
    },
  };
}

export const authStore = createAuthStore();
