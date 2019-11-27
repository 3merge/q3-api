const SchemaVisitorChain = require('../chain');

describe('SchemaVisitorChain', () => {
  describe('constructor', () => {
    it('should define the execution order', () => {
      const inst = new SchemaVisitorChain(['foo', 'bar']);
      expect(inst.executionOrder).toHaveLength(2);
      expect(inst.store).toMatchObject({});
    });
  });

  describe('run', () => {
    it('should execute the $chain generator', async () => {
      const inst = new SchemaVisitorChain(['foo', 'bar']);
      inst.foo = jest.fn();
      inst.bar = jest.fn();

      await inst.run();
      expect(inst.foo).toHaveBeenCalled();
      expect(inst.bar).toHaveBeenCalled();
    });
  });

  describe('checkEmbeddedArray', () => {
    it('should assign value by invoking method', async () => {
      const inst = new SchemaVisitorChain();
      await inst.checkEmbeddedArray(() => 'foo', 'bar');
      expect(inst.store.bar).toBe('foo');
    });

    it('should assign empty array on unknown method', async () => {
      const inst = new SchemaVisitorChain();
      await inst.checkEmbeddedArray(undefined, 'bar');
      expect(inst.store.bar).toEqual([]);
    });
  });
});
