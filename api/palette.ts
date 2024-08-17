import type { PaletteType } from "../stores/paletteStore"

//@ts-ignore
const endpoint = import.meta.env.VITE_DJANGO_DB_URL

export const GetPalletesOfUser = (userId: string) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/palettes/get_user_palettes?user_id=${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => { resolve(data) })
    .catch(reject);
});

export const CreateNewPalette = (payload: PaletteType) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/palettes`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
    .then((resp) => resolve(resp.json()))
    .catch(reject);
});

export const UpdatePalette = (payload: PaletteType) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/palettes/${payload.id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
    .then((resp) => resolve(resp))
    .catch(reject);
});

export const DeletePalette = (id: number) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/palettes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
    .then((resp) => resolve(resp))
    .catch(reject);
});