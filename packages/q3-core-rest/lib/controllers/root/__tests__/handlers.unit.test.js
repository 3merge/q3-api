const ApiMock = require('q3-test-utils/helpers/apiMock');
const Model = require('q3-test-utils/helpers/modelMock');
const {
  Remove,
  RemoveMany,
  Get,
  List,
  Patch,
  Post,
  Upload,
} = require('../handlers');

let req = {};
let res = {};
const api = new ApiMock();

Model.handleReq = function fileHandlerMethod() {
  return this;
};

beforeEach(() => {
  api.inject({
    datasource: Model,
  });

  ({ req, res } = api);
});

afterEach(() => {
  api.reset();
  jest.resetAllMocks();
});

describe('Handlers', () => {
  describe('Delete Controller', () => {
    it('should forward parameter to Model', async () => {
      req.params.resourceID = 1;
      await Remove(req, res);
      expect(Model.archive).toHaveBeenCalledWith(1);
      expect(res.acknowledge).toHaveBeenCalled();
    });
  });

  describe('RemoveMany Controller', () => {
    it('should forward query array to Model', async () => {
      req.query.ids = [1, 2];
      await RemoveMany(req, res);
      expect(Model.archiveMany).toHaveBeenCalledWith([
        1, 2,
      ]);

      expect(res.acknowledge).toHaveBeenCalled();
    });
  });

  describe('Get Controller', () => {
    it('should forward parameter to Model', async () => {
      req.params.resourceID = 1;
      await Get(req, res);
      expect(Model.findStrictly).toHaveBeenCalledWith(1, {
        select: '+uploads',
      });
      expect(res.ok).toHaveBeenCalled();
    });
  });

  describe('List Controller', () => {
    beforeEach(() => {
      Model.getFuzzyQuery = jest.fn().mockReturnValue({
        hello: 'world',
      });

      Model.paginate = jest.fn().mockResolvedValue({
        docs: [],
        totalDocs: 100,
        hasNextPage: true,
        hasPrevPage: true,
      });

      req.datasource = Model;
      req.originalUrl = '/';
    });

    it('should pass smoke', async () => {
      await List(req, res);
    });

    it('should isolate the search query', async () => {
      req.originalUrl = '?search=term&range=1';
      await List(req, res);
      expect(Model.getFuzzyQuery).toHaveBeenCalledWith(
        'term',
      );
    });

    it('should set default paging options', async () => {
      await List(req, res);
      expect(Model.paginate).toHaveBeenCalledWith(
        expect.objectContaining({
          active: true,
        }),
        expect.objectContaining({
          limit: 25,
          page: 1,
        }),
      );
    });
  });

  describe('Post Controller', () => {
    it('should return with create code', async () => {
      const args = { name: 'Mike', age: 28 };
      req.authorizeBody = () => args;

      await Post(req, res);
      expect(Model.create).toHaveBeenCalledWith([args], {
        redact: true,
      });
      expect(res.create).toHaveBeenCalled();
    });
  });

  describe('Patch Controller', () => {
    it('should return with create code', async () => {
      Model.findStrictly.mockResolvedValue({
        ...Model,
        updatedAt: new Date(),
        set: jest.fn().mockReturnValue(Model),
      });

      const args = { name: 'Mike', age: 28 };
      req.params.resourceID = 1;
      req.authorizeBody = () => args;
      await Patch(req, res);
      expect(Model.findStrictly).toHaveBeenCalledWith(1, {
        redact: false,
        select: '+uploads',
      });
      // expect(set).toHaveBeenCalledWith(args);
      expect(res.update).toHaveBeenCalled();
    });
  });

  describe('Upload Controller', () => {
    it('should return call handleFeaturedUpload', async () => {
      const handleFeaturedUpload = jest.fn();
      Model.findStrictly.mockResolvedValue({
        ...Model,
        handleFeaturedUpload,
      });

      req.params.resourceID = 1;
      req.files = { foo: 1 };
      await Upload(req, res);
      expect(Model.findStrictly).toHaveBeenCalledWith(1);
      expect(handleFeaturedUpload).toHaveBeenCalled();
      expect(res.acknowledge).toHaveBeenCalled();
    });

    it('should bypass files', async () => {
      const handleFeaturedUpload = jest.fn();
      req.params.resourceID = 1;
      Model.findStrictly.mockResolvedValue({
        ...Model,
        handleFeaturedUpload,
      });

      await Upload(req, res);
      expect(Model.findStrictly).toHaveBeenCalledWith(1);
      expect(handleFeaturedUpload).not.toHaveBeenCalled();
      expect(res.acknowledge).toHaveBeenCalled();
    });
  });
});
