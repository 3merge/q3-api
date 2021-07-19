const Api = require('q3-test-utils/helpers/apiMock');
const Model = require('q3-test-utils/helpers/modelMock');
const SubController = require('..');

const doc = {
  _id: 1,
  name: 'Smithers',
};

const getApiMocks = () => {
  const { req, res } = new Api();

  Model.exec.mockResolvedValue(doc);
  req.datasource = Model;

  return {
    req,
    res,
  };
};

const getSubController = () => {
  const instance = new SubController(Model, 'name');
  instance.preRoute = [];

  return {
    instance,

    init() {
      instance.addDocumentLookupMiddleware();
      return this;
    },

    invokeFirstPreRoute: (req, res) =>
      instance.preRoute[0](req, res, jest.fn()),
  };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SubController', () => {
  describe('addDocumentLookupMiddleware', () => {
    it('should register new middleware', () => {
      expect(
        getSubController().init().instance.preRoute,
      ).toHaveLength(1);
    });

    it('should attach properties to the req object', async () => {
      const { invokeFirstPreRoute, init } =
        getSubController();
      const { req, res } = getApiMocks();
      req.locals = {};

      init();
      await invokeFirstPreRoute(req, res);
      expect(req.parent).toMatchObject(doc);
      expect(req.fieldName).toMatch('name');
      expect(req.locals).toHaveProperty(
        'fullParentDocument',
      );
    });

    it('should not call select if schema option set', async () => {
      const { init, invokeFirstPreRoute } =
        getSubController();
      const { req, res } = getApiMocks();

      init();
      await invokeFirstPreRoute(req, res);
      expect(Model.select).toHaveBeenCalledWith('+name');
    });
  });
});
