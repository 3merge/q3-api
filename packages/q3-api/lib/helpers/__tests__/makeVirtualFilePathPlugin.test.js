const makeVirtualFilePathPlugin = require('../makeVirtualFilePathPlugin');

jest.mock('../../config/aws', () =>
  jest.fn().mockReturnValue({
    getPublic: jest.fn().mockImplementation((v) => v),
  }),
);

test('makeVirtualFilePathPlugin should make virtual paths', () => {
  const add = jest.fn();
  const get = jest.fn();
  const virtual = jest.fn().mockReturnValue({
    get,
  });

  makeVirtualFilePathPlugin(
    {
      add,
      virtual,
    },
    'test',
  );

  expect(add).toHaveBeenCalledWith({
    testFilePath: String,
  });

  expect(virtual).toHaveBeenCalledWith('test');
  const fn = get.mock.calls[0][0];
  expect(
    fn(undefined, undefined, {
      testFilePath: 'foo.png',
      _id: 1,
    }),
  ).toMatch('1/foo.png');

  expect(
    fn(undefined, undefined, {
      testFilePath: 'null',
      _id: 1,
    }),
  ).toBeNull();
});
