import { get, writable } from "svelte/store";
import {
  CreateNewPalette,
  DeletePalette,
  GetPalletesOfUser,
  UpdatePalette,
} from "../api/palette";
import { authStore } from "../utils/auth/auth_store";
import { alert_store } from "./alertStore";
import { GetDoodlesOfUser } from "../api/doodles";

export interface PaletteType {
  id: number;
  user_id: string | null;
  owner: any;
  name: string;
  colors: string[];
  date_created: string;
}

export const initialPalette: PaletteType = {
  id: 0,
  user_id: get(authStore).user?.id || null,
  owner: null,
  name: "",
  colors: [],
  date_created: "",
};

export const active_palette_store = writable(<PaletteType>initialPalette);

export const user_palettes_store = writable(<PaletteType[]>[]);

export const active_color_store = writable(<string>"rgb(255, 255, 255)");

export const editting_tile_store = writable(<number | null>null);

export const border_index_store = writable(<number | null>null);

export function PushColorIntoActivePalette(newValue: string) {
  active_palette_store.update((prevVal) => {
    let updatedColors = [...prevVal.colors];

    if (updatedColors.length >= 16) {
      updatedColors.shift();
    }

    updatedColors.push(newValue);

    return {
      ...prevVal,
      colors: updatedColors,
    };
  });
}

export function PopFirstColor() {
  const array = get(active_palette_store).colors;
  array.shift();
  active_palette_store.update((preVal) => ({ ...preVal, colors: array }));
}

export function UpdatePaletteName(e: Event) {
  const target = e.target as HTMLInputElement;
  const input = target.value;
  active_palette_store.update((preVal) => ({
    ...preVal,
    name: input,
  }));
}

export function UpdateColorTile(newValue: string, index: number) {
  active_palette_store.update((preVal) => {
    const copy = [...preVal.colors];
    copy[index] = newValue;
    return { ...preVal, colors: copy };
  });
}

export function RemoveFromColorsArray(index: number) {
  const colorPalette = get(active_palette_store).colors;
  colorPalette.splice(index, 1);
  active_palette_store.update((preVal) => ({
    ...preVal,
    colors: colorPalette,
  }));
}

export async function SaveColorPalette(event: SubmitEvent) {
  const activePalette = get(active_palette_store);

  if (!activePalette.name) {
    alert_store.set("alert:Please add a name to the palette before saving!");
    return;
  }
  if (!activePalette.id) {
    //@ts-ignore
    const resp: PaletteType = await CreateNewPalette({
      ...activePalette,
      user_id: get(authStore).user.id,
    });
    active_palette_store.set({
      ...resp,
      user_id: resp.owner.id,
    });
  } else {
    UpdatePalette({ ...activePalette, user_id: get(authStore).user.id });
  }
  alert_store.set("alert:Palette saved sucessfully! ");
  SyncLocalPalettes();
}

export function DeleteColorPalette() {
  if (window.confirm("Are you sure you want to delete this palette?")) {
    const id = get(active_palette_store).id;
    DeletePalette(id).then(() => {
      active_palette_store.set(initialPalette);
      alert_store.set("alert:Palette deleted!");
    });
  }
}

export function ClearPalette() {
  active_palette_store.set(initialPalette);
  editting_tile_store.set(null);
}

export function SyncLocalPalettes() {
  const userId = get(authStore).user.id;
  GetPalletesOfUser(userId).then((data: any) => {
    user_palettes_store.set(data);
  });
}

export function SetPaletteById(id: number) {
  const palettes = get(user_palettes_store);
  const thisPalette = palettes.find((item) => item.id === id);
  if (thisPalette) {
    active_palette_store.set(thisPalette);
  } else {
    console.error("error selecting palette");
  }
}
