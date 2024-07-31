import { event_state_store, selected_store } from "../stores/eventState";

export function ClearSelection() {
  selected_store.set([]);
}