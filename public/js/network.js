const isAvailable = () => new Promise((resolve) => {
  fetch('/api/check', { method: 'HEAD' })
    .then((response) => resolve(response.status === 200))
    .catch(() => resolve(false))
});

const speed = () => new Promise((resolve) => {
  const startTime = new Date().valueOf();
  const abortController = new AbortController();
  const { signal } = abortController;
  let completed = false;

  setTimeout(() => {
    if (!completed) {
      abortController.abort();
    }
  }, 1000);

  fetch('/api/speed', { signal })
    .then((response) => response.blob())
    .then((blob) => {
      completed = true;
      const endTime = new Date().valueOf();
      const time = (endTime - startTime) * 0.001;
      resolve(blob.size / (1024 * 1024 * time));
    })
    .catch((err) => {
      resolve(0)
    })
});

export default { isAvailable, speed };