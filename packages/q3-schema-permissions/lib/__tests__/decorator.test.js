const Model = require('q3-test-utils/helpers/modelMock');
const Decorator = require('../decorators');

describe('Decorator', () => {
  it('should throw an error on missing user', () => {
    const deco = new Decorator();
    expect(() =>
      deco.testOwnership.call({
        ownershipConditions: ['foo=bar'],
      }),
    ).toThrowError();
  });

  it('should do nothing', () => {
    const deco = new Decorator();
    expect(
      deco.testOwnership.call({
        ownershipConditions: [],
      }),
    ).toBeUndefined();
  });

  it('should throw an error on unmet condition', () => {
    const deco = new Decorator();
    expect(() =>
      deco.testOwnership.call(
        {
          ownershipConditions: ['foo=bar'],
        },
        { foo: 'quuz' },
      ),
    ).toThrowError();
  });

  it('should pass condition', () => {
    const deco = new Decorator();
    expect(
      deco.testOwnership.call(
        {
          ownershipConditions: ['foo=bar'],
        },
        { foo: 'bar' },
      ),
    ).toBeUndefined();
  });

  describe('hasGrant', () => {
    it('should throw an error on no results', () =>
      expect(
        Decorator.hasGrant.call(
          Model,
          'CollectionName',
          'Read',
        ),
      ).rejects.toThrowError());

    it('should throw an error if the grant has no field-access defined', async () => {
      Model.exec.mockResolvedValue({
        fields: '',
      });

      await expect(
        Decorator.hasGrant.call(
          Model,
          'CollectionName',
          'Read',
        ),
      ).rejects.toThrowError();

      expect(Model.findOne).toHaveBeenCalledWith({
        active: true,
        coll: 'CollectionName',
        op: 'Read',
        role: 'Public',
      });
    });

    it('should throw an error if the grant has no field-access defined', async () => {
      Model.exec.mockResolvedValue({
        testFields: jest.fn().mockImplementation(() => {
          throw new Error();
        }),
      });

      await expect(
        Decorator.hasGrant.call(
          Model,
          'CollectionName',
          'Read',
        ),
      ).rejects.toThrowError();

      expect(Model.findOne).toHaveBeenCalledWith({
        active: true,
        coll: 'CollectionName',
        op: 'Read',
        role: 'Public',
      });
    });

    it('should append a readOnly access levels', async () => {
      const role = 'Secretary';
      Model.getReadOnlyFieldProps = jest
        .fn()
        .mockImplementation(() => 'firstName');

      Model.exec.mockResolvedValue({
        testFields: jest.fn(),
        testOwnership: jest.fn(),
        fields: '*',
        op: 'Update',
      });

      const doc = await Decorator.hasGrant.call(
        Model,
        'CollectionName',
        'Create',
        { role },
      );

      expect(doc.readOnly).toMatch('firstName');
      expect(Model.findOne).toHaveBeenCalledWith({
        active: true,
        coll: 'CollectionName',
        op: 'Create',
        role,
      });
    });
  });

  describe('testOwnership', () => {
    it('should return undefined without any conditions', () => {
      const inst = new Decorator();
      const resp = inst.testOwnership.call({
        ownershipConditions: [],
      });
      expect(resp).toBeUndefined();
    });

    it('should throw an error', () => {
      const inst = new Decorator();
      expect(() =>
        inst.testOwnership.call(
          { ownershipConditions: ['age=28'] },
          { age: 27 },
        ),
      ).toThrowError();
    });

    it('should return undefined on success', () => {
      const inst = new Decorator();
      expect(
        inst.testOwnership.call(
          { ownershipConditions: ['age=28'] },
          { age: 28 },
        ),
      ).toBeUndefined();
    });
  });
});
