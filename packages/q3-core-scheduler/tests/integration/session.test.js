/* global wait */
const session = require('q3-core-session');
const runner = require('../../lib/runner');
const onSingle = require('./chores/onSingle');

describe('runner', () => {
  it('should invoke with session defined', async () => {
    let v;

    onSingle.mockImplementation(() => {
      v = session.get('TEST');
    });

    await runner(__dirname).execute({
      name: 'onSingle',
      payload: {
        session: {
          TEST: 1,
        },
      },
    });

    return wait(() => {
      expect(v).toBe(1);
    });
  });
});
