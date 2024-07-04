import { Datastore } from '@google-cloud/datastore';

const KIND = 'Submission';
const datastore = new Datastore();

const add = async (data) => {
  const key = datastore.key(KIND);
  const added = await datastore.insert({ key, data });
  return added;
};

const getAll = async () => {
  const query = datastore.createQuery(KIND);
  const [ submissions ] = await datastore.runQuery(query);
  return submissions;
};

export default { add, getAll };