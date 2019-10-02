/**
import { Schema, model, Types } from 'mongoose';
import ctx from 'request-context';
import plugin from '../mongoose';

let schema;
let Model;

beforeAll(() => {
  schema = new Schema(
    {
      name: String,
      age: Number,
    },
    {
      ownership: true,
      groupOwnership: 'friends',
    },
  );

  schema.plugin(plugin);
  Model = model('foo', schema);
});

/*
describe('preSave hook', () => {
  it('should call request', async () => {
    const self = { isNew: true, update: jest.fn() };
    jest.spyOn(ctx, 'get').mockReturnValue({ id: 1 });
    appendSessionData.call(self);
    expect(self.createdBy).toBe(1);
  });

  it('should throw', async () => {
    jest.spyOn(ctx, 'get').mockReturnValue(null);
    expect(() => appendSessionData.call()).toThrowError();
  });

  it('should bypass existing documents', async () => {
    const self = {
      isNew: false,
      set: jest.fn(),
      createdBy: 2,
    };
    jest.spyOn(ctx, 'get').mockReturnValue({ id: 3 });
    appendSessionData.call(self);
    expect(self.createdBy).toBe(2);
  });
});

describe('validateOwnership method', () => {
  it('should return truthy', () => {
    const createdBy = Types.ObjectId();
    jest
      .spyOn(ctx, 'get')
      .mockReturnValue({ id: createdBy });
    expect(
      validateDirectOwnership.call({
        createdBy,
      }),
    ).toBeTruthy();
  });

  it('should be falsy', () => {
    const createdBy = Types.ObjectId();
    jest
      .spyOn(ctx, 'get')
      .mockReturnValue({ id: Types.ObjectId() });
    expect(
      validateDirectOwnership.call({
        createdBy,
      }),
    ).toBeFalsy();
  });
});

describe('validateSharedOwnership method', () => {
  const createdBy = Types.ObjectId();

  beforeAll(() => {
    jest
      .spyOn(ctx, 'get')
      .mockReturnValue({ id: createdBy });
  });

  it('should return falsy', () => {
    expect(
      validateSharedOwnership.call({
        ownedBy: [createdBy],
      }),
    ).toBeTruthy();
  });

  it('should return falsy', () => {
    expect(
      validateSharedOwnership.call({
        ownedBy: [Types.ObjectId()],
      }),
    ).toBeFalsy();
  });
});

 

describe('permissions plugin', () => {
  it('should add new properties property to schema', () => {
    expect(schema.paths).toEqual(
      expect.objectContaining({
        createdBy: expect.any(Object),
        ownedBy: expect.any(Object),
      }),
    );
  });

  it('should run save hook', async () => {
    const id = Types.ObjectId();
    jest.spyOn(ctx, 'get').mockReturnValue({ id });
    expect(
      await Model.create({
        name: 'George',
        age: 42,
      }),
    ).toHaveProperty('createdBy', id);
  });

  it('should ignore on update', async () => {
    const id = Types.ObjectId();
    const ignoreID = Types.ObjectId();
    jest
      .spyOn(ctx, 'get')
      .mockReturnValueOnce({ id }, { ignoreID });
    const doc = await Model.create({
      name: 'John',
      age: 39,
    });
    await doc.save();
    expect(doc.createdBy).toEqual(id);
  });
});
 */
