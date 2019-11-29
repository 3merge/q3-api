const Api = require('q3-test-utils/helpers/apiMock');
const Model = require('q3-test-utils/helpers/modelMock');
const SubController = require('..');

describe('SubController', () => {
  describe('addDocumentLookupMiddleware', () => {
    it('should register new middleware', () => {
      const inst = new SubController(Model);
      inst.app = {
        use: jest.fn(),
      };

      inst.addDocumentLookupMiddleware();
      expect(inst.app.use).toHaveBeenCalled();
    });

    it('should attach properties to the req object', (done) => {
      const inst = new SubController(Model, 'name');
      const { req, res } = new Api();
      req.datasource = Model;
      const doc = {
        _id: 1,
        name: 'Smithers',
      };

      Model.exec.mockResolvedValue(doc);
      Model.verifyOutput = jest.fn();

      inst.app = {
        use: jest.fn().mockImplementation(async (next) => {
          await next(req, res, jest.fn());
          expect(req.parent).toMatchObject(doc);
          expect(req.fieldName).toMatch('name');
          done();
        }),
      };

      inst.addDocumentLookupMiddleware();
    });
  });
});
