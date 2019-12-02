const { Users } = require('q3-api');

const bulkOp = (users, method) =>
  Promise.all(users.map((user) => user[method]()));

test('Handle multiple open sessions', async () => {
  const users = await Users.find().exec();
  await bulkOp(users, 'setPassword');
  const emails = users.map((user) => user.email);

  const keys = await bulkOp(users, 'generateApiKey');
  const results = await Promise.all(
    keys.map((key) =>
      global.agent.get('/profile').set({
        Authorization: `Apikey ${key}`,
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
