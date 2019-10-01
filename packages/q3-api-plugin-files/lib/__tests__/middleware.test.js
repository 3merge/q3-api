const { assignFilesToPublic } = require('../middleware');

test('assignFilesToPublic should push files into req.body', () => {
  const req = { body: {}, files: {} };
  assignFilesToPublic(req, null, jest.fn());
  expect(req.body).toHaveProperty('publicFiles');
});
