const endpoint = import.meta.env.VITE_DJANGO_DB_URL

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
