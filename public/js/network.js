const isAvailable = () => new Promise((resolve) => {
  fetch('/api/check', { method: 'HEAD' })
    .then((response) => resolve(response.status === 200))
    .catch(() => resolve(false))
});

export default { isAvailable };