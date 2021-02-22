const ApiMock = require('q3-test-utils/helpers/apiMock');
const Model = require('q3-test-utils/helpers/modelMock');
const {
  Remove,
  RemoveMany,
  List,
  Patch,
  PatchMany,
  Put,
  Post,
} = require('../handlers');

let req = {};
let res = {};
const api = new ApiMock();

beforeEach(() => {
  api.inject({
    parent: Model,
  });

  ({ req, res } = api);
});

afterEach(() => {
  api.reset();
  jest.resetAllMocks();
});

describe('SubController route handlers', () => {
  describe('List', () => {
    it('should marshal the subdocuments', async () => {
      const subdocs = [{ foo: 'bar' }];
      req.subdocs = subdocs;
      req.fieldName = 'body';
      await List(req, res);
      expect(req.marshal).toHaveBeenCalledWith(subdocs);
      expect(res.ok).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.any(Array),
        }),
      );
    });
  });

  describe('Remove', () => {
    it('should all parent method', async () => {
      req.fieldName = 'foo';
      req.params.fieldID = '1';
      await Remove(req, res);
      expect(res.acknowledge).toHaveBeenCalled();
      expect(Model.removeSubDocument).toHaveBeenCalledWith(
        'foo',
        '1',
      );
    });
  });

  describe('RemoveMany', () => {
    it('should all parent method', async () => {
      req.fieldName = 'foo';
      req.query.ids = ['1', '2'];
      await RemoveMany(req, res);
      expect(res.acknowledge).toHaveBeenCalled();
      expect(
        Model.removeSubDocument,
      ).toHaveBeenCalledWith('foo', ['1', '2']);
    });
  });

  describe('Put', () => {
    it('should set the property', async () => {
      const args = { name: 'Jon' };
      req.body = args;
      req.fieldName = 'friends';

      req.parent = {
        set: jest.fn().mockReturnValue({
          save: jest.fn(),
        }),
      };

      await Put(req, res);
      expect(res.create).toHaveBeenCalled();
      expect(req.parent.set).toHaveBeenCalledWith({
        friends: args,
      });
    });
  });

  describe('Patch', () => {
    it('should set the property', async () => {
      const args = { name: 'Jon' };
      req.body = args;
      req.fieldName = 'friends';
      req.params.fieldID = '1';
      req.parent = {
        updateSubDocument: jest.fn(),
        schema: {
          path: undefined,
        },
      };

      await Patch(req, res);
      expect(res.update).toHaveBeenCalled();
      expect(
        req.parent.updateSubDocument,
      ).toHaveBeenCalledWith('friends', '1', args);
    });
  });

  describe('PatchMany', () => {
    it('should set the property', async () => {
      const args = { name: 'Jon' };
      req.query = { ids: ['1', '2'] };
      req.body = args;
      req.fieldName = 'friends';
      req.parent = {
        updateSubDocuments: jest.fn(),
        schema: {
          path: undefined,
        },
      };

      await PatchMany(req, res);
      expect(res.update).toHaveBeenCalled();
      expect(
        req.parent.updateSubDocuments,
      ).toHaveBeenCalledWith('friends', ['1', '2'], args);
    });
  });

  describe('Post', () => {
    it('should push into the subdocuments', async () => {
      req.body = {};
      req.fieldName = 'foo';
      await Post(req, res);
      expect(Model.pushSubDocument).toHaveBeenCalledWith(
        'foo',
        {},
      );
    });

    it('should throw an error', async () => {
      req.body = {};
      req.fieldName = 'foo';
      req.parent.schema.path = jest.fn().mockReturnValue({
        constructor: { name: 'SingleNestedPath' },
      });

      await expect(Post(req, res)).rejects.toThrowError();
      expect(req.parent.schema.path).toHaveBeenCalled();
    });
  });
});
