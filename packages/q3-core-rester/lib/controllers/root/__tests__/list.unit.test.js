const ApiMock = require('q3-test-utils/helpers/apiMock');
const Model = require('q3-test-utils/helpers/modelMock');
const List = require('../list');

const api = new ApiMock();
const { req, res } = api;

afterEach(() => {
  api.reset();
  jest.resetAllMocks();
});

beforeEach(() => {
  Model.searchBuilder = jest.fn().mockReturnValue({
    hello: 'world',
  });

  Model.paginate = jest.fn().mockReturnValue({
    docs: [],
    total: 0,
  });

  api.inject({
    url: 'localhost',
    datasource: Model,
  });
});

describe('List Controller', () => {
  it('should run', async () => {
    await List(req, res);
  });
});
