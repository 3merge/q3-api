jest.mock('mailgun-js', () =>
  jest.fn().mockReturnValue({
    messages: jest.fn().mockReturnValue({
      send: jest.fn().mockImplementation((v, cb) => {
        cb(null, true);
      }),
    }),
  }),
);

const mg = require('../lib');

describe('Mailgun', () => {
  it('should resolve successfully', () => {
    expect(mg().send()).resolves.toBeTruthy();
  });
});
