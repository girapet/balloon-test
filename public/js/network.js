const isAvailable = () => new Promise((resolve) => {
  fetch('/connection-test.txt', { method: 'HEAD' })
    .then((response) => resolve(response.status === 200))
    .catch(() => resolve(false))
});

export default { isAvailable };