import E3, { app } from 'starter-e3';
import supertest from 'supertest';
import mongoose from 'mongoose';
import routes from '../routes';

let agent;

beforeAll(async () => {
  E3.init();
  E3.setModel(
    'Foo',
    new mongoose.Schema({
      po: String,
    }),
  );
  E3.register(routes('users', 'Foo'));
  await E3.connect();
  agent = supertest(app);
});

describe('/GET', () => {
  it('should return 200', async () => {
    const { body } = await agent.get('/users/1/addresses');
    console.log(body);
  });
});
