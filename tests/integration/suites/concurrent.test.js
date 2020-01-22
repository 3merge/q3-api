const mongoose = require('mongoose');
const { $app, Users, setModel } = require('q3-api');
// eslint-disable-next-line
const { compose } = require('q3-core-composer');
const { get, intercept } = require('q3-core-session');

const Schema = new mongoose.Schema({
  name: String,
});
// eslint-disable-next-line
Schema.post('find', function() {
  // eslint-disable-next-line
  console.log(this.__$q3);
});

const bulkOp = (users, method) =>
  Promise.all(users.map((user) => user[method]()));

const M = setModel('FOR_TESTING', Schema);

test('Handle multiple open sessions', async () => {
  const users = await Users.find().exec();
  await bulkOp(users, 'setPassword');
  const emails = users.map((user) => user.email);

  const keys = await bulkOp(users, 'generateApiKey');
  const results = await Promise.all(
    keys.map((k) =>
      global.agent.get('/profile').set({
        Authorization: `Apikey ${k}`,
      }),
    ),
  );

  expect(
    results
      .map((result) => result.body.profile)
      .every((props, i) => props.email === emails[i]),
  ).toBeTruthy();

  expect(
    results
      .map((result) => result.status)
      .every((code) => code === 200),
  ).toBeTruthy();
});

describe('API session', () => {
  it('session should be reachable from within externals', async () => {
    const key = 'TEST';
    const verifySession = () => {
      expect(get(key)).toMatchObject({
        test: true,
      });
    };

    intercept(key, (req) => {
      return req.headers;
    });

    $app.get(
      '/foo',
      compose((req, res) => {
        verifySession();
        res.ok();
      }),
    );

    await global.agent.get('/foo').set({ test: true });
    expect(get(key)).toBeUndefined();
  });

  it.only('session should be reachable from within mongo middleware', async (done) => {
    const key = 'TEST';

    await M.create({
      name: 'Bob',
    });

    intercept(key, () => {
      return 'Retained';
    });

    $app.get(
      '/async',
      compose(async (req, res) => {
        await M.find().exec();
        res.ok();
      }),
    );

    return global.agent.get('/async').then(() => {
      expect(get(key)).toBeUndefined();
      done();
    });
  });
});
