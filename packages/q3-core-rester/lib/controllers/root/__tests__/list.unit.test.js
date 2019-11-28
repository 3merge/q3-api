const ApiMock = require('q3-test-utils/helpers/apiMock');
const Model = require('q3-test-utils/helpers/modelMock');
const List = require('../list');

const api = new ApiMock();
const { req, res } = api;

beforeEach(() => {
  Model.searchBuilder = jest.fn().mockReturnValue({
    hello: 'world',
  });

  Model.paginate = jest.fn().mockResolvedValue({
    docs: [],
    totalDocs: 100,
    hasNextPage: true,
    hasPrevPage: true,
  });

  api.inject({
    datasource: Model,
    originalUrl: '/',
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('List Controller', () => {
  it('should pass smoke', async () => {
    await List(req, res);
  });

  it('should isolate the search query', async () => {
    req.originalUrl = '?search=term&range=1';
    await List(req, res);
    expect(Model.searchBuilder).toHaveBeenCalledWith(
      'term',
    );
  });

  it('should set default paging options', async () => {
    await List(req, res);
    expect(Model.paginate).toHaveBeenCalledWith(
      expect.objectContaining({
        active: true,
        hello: 'world',
      }),
      expect.objectContaining({
        limit: 50,
        page: 1,
      }),
    );
  });

  it('should return as CSV formatting', async () => {
    req.get.mockReturnValue('text/csv');
    req.t.mockImplementation((v) => v.split(':')[1]);
    req.marshal.mockReturnValue([
      { name: { first: 'Mike' } },
    ]);

    await List(req, res);
    expect(res.csv).toHaveBeenCalledWith(
      [{ 'name.first': 'Mike' }],
      true,
    );
  });
});
