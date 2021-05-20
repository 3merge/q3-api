const Builder = require('../../lib/extendedReference');

describe('ExtendedReference', () => {
  describe('static "plugin"', () => {
    it('should register save middleware', (done) => {
      const pre = jest.fn();
      const post = jest.fn().mockImplementation((v, fn) => {
        expect(v === 'save' || v === 'remove').toBeTruthy();
        expect(fn).toEqual(expect.any(Function));
        done();
      });

      Builder.plugin({ post, pre });
    });
  });

  describe('"on"', () => {
    it('should assign type values to all paths', () => {
      const inst = new Builder();
      inst.$ref = {
        schema: { paths: { foo: { instance: String } } },
      };

      inst.on(['foo']);
      expect(inst.$opts).toMatchObject({
        ref: { type: expect.any(Function) },
        foo: { type: String },
      });
    });

    it('should omit path if type does not exist', () => {
      const inst = new Builder();
      inst.$ref = {
        schema: { paths: { bar: { instance: String } } },
      };

      inst.on(['foo']);
      expect(inst.$opts).not.toHaveProperty('bar');
    });
  });

  describe('"set"', () => {
    it('should modify path', () => {
      const inst = new Builder();
      inst.$opts = { name: {} };

      expect(inst.set('name', { select: false }));
      expect(inst.$opts.name).toHaveProperty(
        'select',
        false,
      );
    });

    it('should throw an error without the path', () => {
      const inst = new Builder();
      expect(() =>
        inst.set('name', { select: false }),
      ).toThrowError();
    });
  });
});
