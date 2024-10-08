const endpoint = (import.meta as any).env.VITE_DJANGO_DB_URL

interface ShareDoodleType{
  doodle_id: number
  email: string
}

interface RemoveDoodleType{
  user_id: number
  doodle_id: number
}

export const CreateNewDoodle = (payload: any) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/doodles`, {
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

export const UpdateDoodle = (payload: any) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/doodles/${payload.id}`, {
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

export const GetDoodlesOfUser = (userId: string) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/doodles/get_user_doodles?user_id=${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      resolve(data);
    })
    .catch(reject);
});

export const GetSingleDoodle = (id: number) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/doodles/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      resolve(data);
    })
    .catch(reject);
});

export const DeleteDoodle = (id: number) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/doodles/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((data) => {
      resolve(data);
    })
    .catch(reject);
});

export const ShareDoodle = (payload: ShareDoodleType) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/doodle_collabs/add_doodle_collab`, {
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

export const RemoveCollabFromDoodle = (payload: RemoveDoodleType) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/doodle_collabs/remove_doodle_collab`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
    .then((resp) => resolve(resp))
    .catch(reject);
});