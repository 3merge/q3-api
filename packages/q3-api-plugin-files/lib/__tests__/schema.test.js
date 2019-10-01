const path = require('path');
const { FileUploadAdapter } = require('../schema');

const mockgoose = {
  save: jest.fn(),
  privateFiles: {
    addToSet: jest.fn(),
  },
  publicFiles: {
    addToSet: jest.fn(),
  },
};

const fixture = path.resolve(
  __dirname,
  '../__fixtures__/astronaut.png',
);

jest.mock('../aws');

beforeEach(() => {
  mockgoose.save.mockReset();
});

describe('handleFeaturedPhoto', () => {
  it('should return null', async () => {
    const inst = new FileUploadAdapter();
    expect(await inst.handleFeaturedPhoto()).toBeNull();
  });

  it('should call putPublic', async () => {
    const inst = new FileUploadAdapter();
    await inst.handleFeaturedPhoto.call(mockgoose, {
      photo: fixture,
    });
    expect(mockgoose.save).toHaveBeenCalled();
  });
});

describe('Bulk uploading', () => {
  it('should call privateFiles', async () => {
    const inst = new FileUploadAdapter();
    await inst.handlePrivateFiles.call(mockgoose, {
      po: fixture,
      receipt: fixture,
    });

    expect(
      mockgoose.privateFiles.addToSet.mock.calls,
    ).toHaveLength(2);
  });
});
