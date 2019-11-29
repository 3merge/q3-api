const ApiMock = require('q3-test-utils/helpers/apiMock');
const Model = require('q3-test-utils/helpers/modelMock');
const {
  Remove,
  RemoveMany,
  List,
  Patch,
  Post,
  Put,
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
      expect(Model.removeSubDocument).toHaveBeenCalledWith(
        'foo',
        ['1', '2'],
      );
    });
  });

  describe('Put', () => {
    it('should set the property', async () => {
      const args = { name: 'Jon' };
      req.body = args;
      req.fieldName = 'friends';
      Model.set.mockImplementation(() => ({
        save: jest.fn(),
      }));

      await Put(req, res);
      expect(res.create).toHaveBeenCalled();
      expect(Model.set).toHaveBeenCalledWith({
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
      await Patch(req, res);
      expect(res.update).toHaveBeenCalled();
      expect(Model.updateSubDocument).toHaveBeenCalledWith(
        'friends',
        '1',
        args,
      );
    });
  });
});
