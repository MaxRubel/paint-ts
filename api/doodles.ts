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