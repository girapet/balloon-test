
const NAME = 'submissions';
let database;

const getDatabase = () => new Promise((resolve, reject) => {
  if (database) {
    resolve(database);
  }

  const request = window.indexedDB.open(NAME, 1);
  request.onsuccess = () => {
    database = request.result;
    resolve(database);
  }
  request.onerror = () => reject();
  request.onupgradeneeded = () => request.result.createObjectStore(NAME, { autoIncrement: true });
});

const getObjectStore = (mode = 'readonly') => new Promise((resolve, reject) => {
  getDatabase().then((db) => {
    const transaction = db.transaction([NAME], mode);
    const objectStore = transaction.objectStore(NAME);
    resolve(objectStore);  
  })
  .catch(() => reject());
});

const add = (submission) => new Promise((resolve, reject) => {
  getObjectStore('readwrite').then((objectStore) => {
    const request = objectStore.add(submission);
    request.onsuccess = () => {
      objectStore.transaction.commit();
      resolve();
    }
    request.onerror = () => reject();
  })
  .catch(() => reject());
});

const count = () => new Promise((resolve, reject) => {
  getObjectStore().then((objectStore) => {
    const request = objectStore.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject();
  })
  .catch(() => reject());
});

const getAll = () => new Promise((resolve, reject) => {
  getObjectStore().then((objectStore) => {
    const request = objectStore.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject();
  })
  .catch(() => reject());
});

const empty = () => new Promise((resolve, reject) => {
  getObjectStore('readwrite').then((objectStore) => {
    const request = objectStore.clear();
    request.onsuccess = () => {
      objectStore.transaction.commit();
      resolve();
    }
    request.onerror = () => reject();
  })
  .catch(() => reject());
});

const send = () => new Promise((resolve) => {
  (async () => {
    const submissions = await getAll();

    for (const submission of submissions) {
      await fetch('/api/add', {
        method: 'POST',
        body: JSON.stringify(submission),
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }

    await empty();
    resolve();
  })();
});

export default { add, count, send }