const PluginFilemanager = require('..');

const add = jest.fn();
const get = jest.fn();

const plugin = PluginFilemanager({
  add,
  get,
});

const getFilesStub = () => ({
  files: {
    foo: {
      name: 'foo.png',
    },
    bar: {
      name: 'bar.pdf',
    },
  },
});

const setupMockDatasource = () => {
  const methods = [
    'addMethod',
    'addPathSetter',
    'addVirtualGetter',
    'extend',
    'define',
    'out',
  ];

  const context = {
    Types: {},
  };

  const assignParmamsToContext = (param1, param2) => {
    if (typeof param1 === 'string') {
      context[param1] = param2;
    } else if (param1) {
      context[param1.name] = param1;
    }

    return context;
  };

  methods.forEach((item) =>
    Object.assign(context, {
      [item]: jest
        .fn()
        .mockImplementation(assignParmamsToContext),
    }),
  );

  return plugin(context, context);
};

beforeEach(() => {
  add.mockClear();
  get.mockClear();
});

describe('PluginFilemanager', () => {
  describe('"handleFeaturedUpload"', () => {
    it('should add the first file via adapter', async () => {
      const save = jest.fn();
      await setupMockDatasource().handleFeaturedUpload.call(
        {
          id: 1,
          save,
        },
        getFilesStub(),
      );

      expect(add).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: '1/foo.png',
          data: expect.any(Object),
          sensitive: false,
        }),
      );

      expect(save).toHaveBeenCalled();
    });
  });

  describe('"handleUpload"', () => {
    it('should iterate files and push to uploads', async () => {
      const context = {
        id: 1,
        uploads: [],
        save: jest.fn(),
      };

      await setupMockDatasource().handleUpload.call(
        context,
        getFilesStub(),
      );

      expect(add).toHaveBeenCalledTimes(2);
      expect(context.uploads).toHaveLength(2);
      expect(context.save).toHaveBeenCalled();
    });
  });

  describe('"getFilePath"', () => {
    it('should find matching upload', async () => {
      const context = {
        uploads: [
          {
            relativePath: 'foo/bar.pdf',
            name: 'bar',
          },
        ],
      };

      setupMockDatasource().getFilePath.call(
        context,
        'foo',
      );

      expect(
        setupMockDatasource().getFilePath.call(
          context,
          'foo',
        ),
      ).toMatch('bar');
    });
  });
});
