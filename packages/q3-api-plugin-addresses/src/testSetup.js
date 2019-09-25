// eslint-disable-next-line
import Mongo from 'mongodb-memory-server';

beforeAll(async () => {
  global.db = new Mongo();
  process.env.CONNECTION = await global.db.getConnectionString();
});

afterAll(async () => {
  await global.db.stop();
});
