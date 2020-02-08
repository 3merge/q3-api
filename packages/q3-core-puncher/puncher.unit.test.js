const puncher = require('.');

const matchErrorMsg = (fn, msg) => {
  try {
    fn();
  } catch (err) {
    expect(err).toBeDefined();
    expect(err.message).toMatch(msg);
  }
};

test('Puncher', () => {
  const newHandle = () => 'Overwritten';
  const stub = {
    stack: [
      {
        route: {
          path: '/foo',
          stack: [
            {
              method: 'get',
              handle: () => 'Previous',
            },
          ],
        },
      },
    ],
  };

  expect(stub.stack[0].route.stack[0].handle()).toMatch(
    'Previous',
  );

  puncher(stub, {
    path: '/foo',
    method: 'get',
    handle: newHandle,
  });

  expect(stub.stack[0].route.stack[0].handle()).toMatch(
    'Overwritten',
  );
});

describe('Puncher validation', () => {
  it('should error without app', () => {
    matchErrorMsg(
      () => puncher({ layer: null }, {}),
      'Stack',
    );
  });

  it('should error without path', () => {
    matchErrorMsg(
      () => puncher({ stack: null }, {}),
      'Path',
    );
  });

  it('should error without known method', () => {
    matchErrorMsg(
      () =>
        puncher(
          { stack: null },
          { path: '/hello', method: 'use' },
        ),
      'Method',
    );
  });

  it('should error without known method', () => {
    matchErrorMsg(
      () =>
        puncher(
          { stack: null },
          { path: '/hello', method: 'get', handle: 'Hey' },
        ),
      'Handle',
    );
  });
});
