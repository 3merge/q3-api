const fs = require('fs');
const path = require('path');
const { Types } = require('mongoose');
const FileUploadAdapter = require('../adapter');

jest.mock('../../aws');

const cdn = 'https://google.ca';
const findOne = jest.fn();

const fixture = {
  name: 'astroman',
  type: 'png',
  data: fs.readFileSync(
    path.resolve(
      __dirname,
      '../../__fixtures__/astronaut.png',
    ),
  ),
};

test('upload should return with new files', async () => {
  const create = jest.fn().mockImplementation((v) => v);
  const resp = await FileUploadAdapter.upload.call(
    { create },
    {
      topic: Types.ObjectId(),
      model: 'Demo',
      sensitive: true,
      files: {
        fixture2: fixture,
        fixture,
      },
    },
  );

  expect(create).toHaveBeenCalled();
  expect(resp).toHaveLength(2);
});

test('archive should call save', async () => {
  const save = jest.fn();
  const set = jest.fn();
  findOne.mockResolvedValue({ id: 1, set, save });
  await FileUploadAdapter.archive.call({ findOne });
  expect(set).toHaveBeenCalled();
  expect(save).toHaveBeenCalled();
});

describe('findSignedById', () => {
  beforeAll(() => {
    process.env.CDN = cdn;
  });

  beforeEach(() => {
    findOne.mockReset();
  });

  it('should throw', () => {
    findOne.mockResolvedValue(null);
    expect(
      FileUploadAdapter.findSignedById.call(
        { findOne },
        Types.ObjectId(),
      ),
    ).rejects.toThrowError();
  });

  it('should return prefixed with CDN', () => {
    findOne.mockResolvedValue({
      name: 'foo',
      model: 'Bar',
      topic: 1,
      sensitive: false,
    });
    expect(
      FileUploadAdapter.findSignedById.call({ findOne }, 1),
    ).resolves.toBe(`${cdn}/Bar/1/foo`);
  });

  it('should return suffixed with shh!', () => {
    findOne.mockResolvedValue({
      name: 'foo',
      model: 'Bar',
      topic: 1,
      sensitive: true,
    });
    expect(
      FileUploadAdapter.findSignedById.call({ findOne }, 1),
    ).resolves.toBe('Bar/1/foo?shh!');
  });
});
