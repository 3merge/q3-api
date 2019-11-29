const { join, resolve } = require('path');
const Walker = require('../walker');

describe('DirectoryWalker', () => {
  let inst;

  beforeAll(() => {
    inst = new Walker(__dirname);
  });

  it('should return an export', () => {
    inst.setContext(__dirname, '../../fixtures/routes/get');
    expect(inst.getController()).toEqual(
      expect.any(Function),
    );
  });

  it('should return an API URI', () => {
    inst.setContext(join(__dirname, 'test'), 'get.id.js');
    expect(inst.getSlug()).toBe('/test/:testID');
  });

  it('should register a new route', () => {
    const app = { post: jest.fn() };
    inst.setContext(
      resolve(
        __dirname,
        '../../fixtures/routes/authenticate',
      ),
      'post.js',
    );
    inst.exec(app);
    expect(app.post).toHaveBeenCalled();
  });
});
