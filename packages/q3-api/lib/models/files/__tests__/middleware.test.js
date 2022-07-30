const mongoose = require('mongoose');
const { map } = require('lodash');
const {
  ensureFolderStructure,
  makeNameWithFileExtension,
  generateFolderStats,
  generateRelativePaths,
} = require('../middleware');

const ensureObjectId = (obj) => {
  if (!obj._id)
    Object.assign(obj, {
      _id: mongoose.Types.ObjectId(),
    });

  // eslint-disable-next-line
  obj.isDirectModified = jest.fn().mockReturnValue(true);
  return obj;
};

const toObjectContaining = (obj) =>
  expect.objectContaining(obj);

describe('middleware', () => {
  describe('ensureFolderStructure', () => {
    it('should nullify missing folders and extract undefined ones', () => {
      const folderThatDoesntExist =
        mongoose.Types.ObjectId();

      const folderThatExists = mongoose.Types.ObjectId();
      const remove = jest.fn();

      const context = {
        uploads: [
          {
            folderId: folderThatExists,
            name: 'favourites',
          },
          {
            folderId: folderThatDoesntExist,
            name: 'lost',
            remove,
          },
          {
            folderId: null,
            name: 'test.txt',
          },
          {
            _id: folderThatExists,
            name: 'archives',
            folder: true,
          },
        ].map(ensureObjectId),
      };

      ensureFolderStructure.call(context);
      expect(remove).toHaveBeenCalled();

      expect(context.uploads).toEqual(
        [
          {
            folderId: folderThatExists,
            name: 'favourites',
            bucketId: 'favourites',
          },
          {
            // will have actually deleted it
            folderId: folderThatDoesntExist,
            name: 'lost',
            bucketId: 'lost',
          },
          {
            name: 'test.txt',
            bucketId: 'test.txt',
          },
          {
            name: 'archives',
            folder: true,
            bucketId: 'archives',
          },
        ].map(toObjectContaining),
      );
    });
  });

  describe('generateFolderStats', () => {
    it('should find max date and sum sizes', () => {
      const folders = generateFolderStats([
        {
          _id: 1,
          folderId: null,
          folder: true,
          updatedAt: '2022-04-26T15:11:11.939Z',
        },
        {
          _id: 2,
          folderId: null,
          size: 110,
        },
        {
          _id: 3,
          folderId: 1,
          size: 20,
        },
        {
          _id: 4,
          folderId: 1,
          folder: true,
          updatedAt: '2022-07-26T15:11:11.939Z',
        },
        {
          _id: 5,
          folderId: 4,
          size: 43,
          updatedAt: '2022-01-26T15:11:11.939Z',
        },
        {
          _id: 6,
          folderId: null,
          folder: true,
          updatedAt: '2021-07-26T15:11:11.939Z',
        },
        {
          _id: 7,
          folderId: 6,
          size: 13,
          updatedAt: '2022-03-26T15:11:11.939Z',
        },
      ]);

      expect(folders[0]).toEqual({
        _id: 1,
        folderId: null,
        folder: true,
        updatedAt: '2022-07-26T15:11:11.939Z',
        size: 63,
      });

      expect(folders[3]).toEqual({
        _id: 4,
        folderId: 1,
        folder: true,
        size: 43,
        updatedAt: '2022-07-26T15:11:11.939Z',
      });

      expect(folders[5]).toEqual({
        _id: 6,
        folderId: null,
        folder: true,
        size: 13,
        updatedAt: '2022-03-26T15:11:11.939Z',
      });
    });
  });

  describe('generateRelativePaths', () => {
    it('should interpret folder id references', () => {
      const uploads = [
        {
          _id: 1,
          name: 'public',
        },
        {
          _id: 2,
          folderId: 1,
          name: 'media',
        },
        {
          folderId: 2,
          name: 'test.jpg',
        },
      ];

      generateRelativePaths(uploads);
      expect(map(uploads, 'relativePath')).toEqual([
        'public',
        'public/media',
        'public/media/test.jpg',
      ]);
    });
  });

  describe('makeNameWithFileExtension', () => {
    it('should return name', () => {
      expect(
        makeNameWithFileExtension({ name: 'foobar' }),
      ).toEqual('foobar');
    });

    it('should preserve folder', () => {
      expect(
        makeNameWithFileExtension({
          bucketId: 'foobar',
          name: 'quuz',
        }),
      ).toEqual('quuz');
    });

    it('should return name with extension', () => {
      expect(
        makeNameWithFileExtension({
          bucketId: 'previous.png',
          name: 'foobar',
        }),
      ).toEqual('foobar.png');
    });
  });
});
