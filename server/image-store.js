import { Storage } from '@google-cloud/storage';

const BUCKET_NAME = 'island-pond-balloon-test';

const getBucket = () => {
  const storage = new Storage();
  return storage.bucket(BUCKET_NAME);
};

const add = async (id, image) => {
  const bucket = getBucket();
  const file = bucket.file(`${id}.jpg`);
  await file.save(image, { contentType: 'image/jpeg' });
};

const get = async (id) => {
  const bucket = getBucket();
  const file = bucket.file(`${id}.jpg`);
  const [ image ] = await file.download();
  return image;
};

export default { add, get };