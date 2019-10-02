const Q3 = require('q3-api').default;
const { Schema, Types } = require('mongoose');
const supertest = require('supertest');
const plugin = require('..');

const userID = Types.ObjectId().toString();

let agent;
let threadID;
let noteID;

beforeAll(async () => {
  const app = Q3.init();
  const userModelName = 'demo-users';

  agent = supertest(app);
  // mock auth
  app.use((req, res, next) => {
    req.user = {};
    req.user.id = userID;
    next();
  });

  Q3.setModel(
    userModelName,
    new Schema({
      email: String,
      firstName: String,
    }),
  );

  Q3.register(plugin, {
    userModelName,
  });

  await Q3.connect();
  await Q3.model(userModelName).create({
    _id: userID,
    email: 'mike@gmail.com',
    firstName: 'Mike',
  });
});

describe('POST to notes', () => {
  it('should create a new topic', async () => {
    const { body, status } = await agent
      .post('/notes')
      .send({
        topic: Types.ObjectId().toString(),
        message: 'Hey, there.',
      });

    ({ id: noteID } = body.note);
    [{ id: threadID }] = body.note.thread;

    expect(status).toBe(201);
    expect(body.note.thread).toHaveLength(1);
    expect(noteID).toBeDefined();
    expect(threadID).toBeDefined();
  });
});

describe('GET on notes', () => {
  it('should return an item in thread', async () => {
    const { body, status } = await agent.get(
      `/notes/${noteID}/${threadID}`,
    );
    expect(status).toBe(200);
    expect(body.thread).toHaveProperty('id');
  });
});

describe('GET on notes', () => {
  it('should return notes associated with the user', async () => {
    const { body, status } = await agent.get('/notes');
    expect(status).toBe(200);
    expect(body.notes).toHaveLength(1);
  });
});

describe('PUT to note', () => {
  it('should add new thread', async () => {
    const { body, status } = await agent
      .put(`/notes/${noteID}`)
      .send({
        message: 'Hey, there.',
      });

    expect(status).toBe(201);
    expect(body.note.thread).toHaveLength(2);
  });
});

describe('PATCH to a thread', () => {
  it('should update an item in the thread', async () => {
    const { status } = await agent
      .patch(`/notes/${noteID}/${threadID}`)
      .send({
        message: 'Hey, again.',
      });

    expect(status).toBe(200);
  });
});

describe('DELETE on note', () => {
  it('should remove thread', async () => {
    const { status } = await agent.delete(
      `/notes/${noteID}/${threadID}`,
    );

    expect(status).toBe(204);
  });

  it('should remove topic', async () => {
    const { status } = await agent.delete(
      `/notes/${noteID}`,
    );

    expect(status).toBe(204);
  });
});
