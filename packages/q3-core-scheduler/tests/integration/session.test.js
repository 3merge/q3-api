const session = require('q3-core-session');
const runner = require('../../lib/runner');
const onSingle = require('./chores/onSingle');

describe('runner', () => {
  it('should invoke with session defined', async (done) => {
    onSingle.mockImplementation(() => {
      expect(session.get('TEST')).toBe(1);
      done();
    });

    await runner(__dirname).execute({
      name: 'onSingle',
      payload: {
        session: {
          TEST: 1,
        },
      },
    });
  });
});
