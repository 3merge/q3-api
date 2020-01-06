const Api = require('q3-test-utils/helpers/apiMock');
const Model = require('q3-test-utils/helpers/modelMock');
const SubController = require('..');

beforeEach(() => {
  jest.resetAllMocks();
});

describe('SubController', () => {
  describe('addDocumentLookupMiddleware', () => {
    it('should register new middleware', () => {
      const inst = new SubController(Model);
      inst.preRoute = [];

      inst.addDocumentLookupMiddleware();
      expect(inst.preRoute).toHaveLength(1);
    });

    it('should attach properties to the req object', async () => {
      const inst = new SubController(Model, 'name');
      const { req, res } = new Api();
      req.datasource = Model;
      const doc = {
        _id: 1,
        name: 'Smithers',
      };

      req.datasource.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(doc),
        }),
      });

      Model.verifyOutput = jest.fn();

      inst.addDocumentLookupMiddleware();
      await inst.preRoute[0](req, res, jest.fn());
      expect(req.parent).toMatchObject(doc);
      expect(req.fieldName).toMatch('name');
    });

    it('should not call select if schema option set', async () => {
      const inst = new SubController(Model, 'name');
      const { req, res } = new Api();
      const select = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      req.datasource = Model;

      req.datasource.findById = jest.fn().mockReturnValue({
        select,
      });

      Model.exec.mockResolvedValue({ _id: 1 });
      Model.verifyOutput = jest.fn();

      inst.addDocumentLookupMiddleware();
      await inst.preRoute[0](req, res, jest.fn());
      expect(select).toHaveBeenCalledWith('+name');
    });
  });
});
