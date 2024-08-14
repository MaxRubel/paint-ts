import { writable } from "svelte/store";

export const auth_store = writable({
    user: null,
    user_db: null
})

function createAuthStore() {
    const storedUser = localStorage.getItem('user');
    const initialUser = storedUser ? JSON.parse(storedUser) : null;

    const { subscribe, set, update } = writable({ user: initialUser });

    return {
        subscribe,
        setUser: (user: any) => {
            update(state => ({ ...state, user }));
            localStorage.setItem('user', JSON.stringify(user));
        },

        clearUser: () => {
            set({ user: null });
            localStorage.removeItem('user');
        },
    };
}

export const authStore = createAuthStore();

