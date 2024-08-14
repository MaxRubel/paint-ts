const endpoint = import.meta.env.VITE_DJANGO_DB_URL

console.log(endpoint)


export const CheckUser = (uid: string) => new Promise((resolve, reject) => {
    fetch(`${endpoint}/checkuser`, {
      method: 'POST',
      body: JSON.stringify({
        uid,
      }),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((resp) => resolve(resp.json()))
      .catch(reject);
  });