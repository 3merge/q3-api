const Api = require('q3-test-utils/helpers/apiMock');
const Model = require('q3-test-utils/helpers/modelMock');
const SubController = require('..');

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

      Model.exec.mockResolvedValue(doc);
      Model.verifyOutput = jest.fn();

      inst.addDocumentLookupMiddleware();
      await inst.preRoute[0](req, res, jest.fn());
      expect(req.parent).toMatchObject(doc);
      expect(req.fieldName).toMatch('name');
    });
  });
});
