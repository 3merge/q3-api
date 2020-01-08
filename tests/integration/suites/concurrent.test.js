const { Users } = require('q3-api');
const moment = require('moment');

let key;

const bulkOp = (users, method) =>
  Promise.all(users.map((user) => user[method]()));

test('Handle multiple open sessions', async () => {
  const users = await Users.find().exec();
  await bulkOp(users, 'setPassword');
  const emails = users.map((user) => user.email);

  const keys = await bulkOp(users, 'generateApiKey');
  [key] = keys;
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

test.skip('ETag should handle 304 status', async () => {
  const { headers, status } = await global.agent
    .get('/profile')
    .set({
      Authorization: `Apikey ${key}`,
    });

  const { etag } = headers;
  expect(status).toBe(200);

  const { status: newStatus } = await global.agent
    .get('/profile')
    .set({
      Authorization: `Apikey ${key}`,
      'If-None-Match': etag,
      'Cache-Control': 'private',
    });

  expect(newStatus).toBe(304);
});

test.skip('Headers should handle race conditions', async () => {
  const yesterday = moment()
    .subtract(1, 'days')
    .toISOString();
  const { status, headers } = await global.agent
    .patch('/profile')
    .send({ firstName: 'Mike' })
    .set({
      Authorization: `Apikey ${key}`,
    });

  expect(status).toBe(200);

  const { status: staleStatus } = await global.agent
    .patch('/profile')
    .send({ firstName: 'Mike' })
    .set({
      Authorization: `Apikey ${key}`,
      'If-Unmodified-Since': yesterday,
    });

  const { status: okStatus } = await global.agent
    .patch('/profile')
    .send({ firstName: 'Mike' })
    .set({
      Authorization: `Apikey ${key}`,
      'If-Unmodified-Since': headers['last-modified'],
    });

  expect(staleStatus).toBe(412);
  expect(okStatus).toBe(200);
});
