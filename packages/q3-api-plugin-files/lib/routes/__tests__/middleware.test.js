const middleware = require('../middleware');

test('middleware should push files into req.body', () => {
  const req = { body: {}, files: {} };
  middleware(req, null, jest.fn());
  expect(req.body).toHaveProperty('files');
});
