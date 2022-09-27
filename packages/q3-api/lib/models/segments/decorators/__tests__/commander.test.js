const mongoose = require('mongoose');
const Commander = require('../commander');

jest.mock('../../../../helpers/utils', () => ({
  objectIdEquals: jest
    .fn()
    .mockImplementation((a, b) => String(a) === String(b)),
}));

const makeToJson = (args) =>
  jest.fn().mockReturnValue({
    _id: 1,
    createdAt: 1,
    label: 1,
    updatedAt: 1,
    value: 1,
    ...args,
  });

describe('Segments>Commander', () => {
  describe('mapEntries', () => {
    it('should extract entries from document', () => {
      const c = new Commander().mapEntries.call(
        {
          collectionName: 'test',
          entries: [
            {
              toJSON: makeToJson({
                visibility: ['Customer'],
              }),
            },
          ],
        },
        {
          developer: true,
        },
      );

      expect(c).toEqual([
        {
          collectionName: 'test',
          id: 1,
          label: 1,
          value: 1,
          visibility: ['Customer'],
        },
      ]);
    });

    it.only('should include parent folders', () => {
      const c = new Commander().mapEntries.call(
        {
          collectionName: 'test',
          entries: [
            {
              toJSON: makeToJson({
                label: 'Include',
                folder: true,
                _id: 2,
              }),
            },
            {
              toJSON: makeToJson({
                label: 'Exclude',
                folder: true,
                _id: 3,
              }),
            },
            {
              toJSON: makeToJson({
                folderId: 2,
                visibility: ['Administrator'],
              }),
            },
          ],
        },
        {
          role: 'Administrator',
        },
      );

      expect(c).toEqual([
        {
          collectionName: 'test',
          id: 2,
          label: 'Include',
          value: 1,
          folder: true,
        },
        {
          collectionName: 'test',
          id: 1,
          label: 1,
          value: 1,
          folderId: 2,
        },
      ]);
    });

    it('should filter entries by role type', () => {
      const c = new Commander().mapEntries.call(
        {
          collectionName: 'test',
          entries: [
            {
              toJSON: makeToJson({
                visibility: ['Sales'],
              }),
            },
            {
              toJSON: makeToJson({
                visibility: ['Administrator'],
              }),
            },
          ],
        },
        {
          role: 'Administrator',
        },
      );

      expect(c).toEqual([
        {
          collectionName: 'test',
          id: 1,
          label: 1,
          value: 1,
        },
      ]);
    });
  });

  describe('addToEntries', () => {
    it('should start array', () => {
      const c = new Commander().addToEntries({
        foo: 1,
      });

      expect(c.entries).toHaveLength(1);
    });

    it('should push into array', () => {
      const c = new Commander().addToEntries.call(
        {
          entries: [
            {
              foo: 1,
            },
          ],
        },
        {
          bar: 1,
        },
      );

      expect(c.entries).toHaveLength(2);
    });
  });

  describe('getEntry', () => {
    it('should error', () => {
      expect(() =>
        new Commander().getEntry(1),
      ).toThrowError();
    });

    it('should error', () => {
      expect(() =>
        new Commander().getEntry.call(
          {
            entries: {
              id: jest.fn().mockReturnValue(null),
            },
          },
          1,
        ),
      ).toThrowError();
    });

    it('should return entry', () => {
      expect(
        new Commander().getEntry.call(
          {
            entries: {
              id: jest.fn().mockReturnValue({
                test: 1,
              }),
            },
          },
          1,
        ),
      ).toMatchObject({
        test: 1,
      });
    });
  });

  describe('removeEntry', () => {
    it('should remove entry and associated folder ids', () => {
      const id = mongoose.Types.ObjectId().toString();
      const remove = jest.fn();
      const getEntry = jest.fn().mockReturnValue({
        remove,
      });

      new Commander().removeEntry.call(
        {
          getEntry,
          entries: [
            {
              folderId: id,
              remove,
            },
            {
              folderId: null,
              remove,
            },
          ],
        },
        {
          id,
        },
      );

      expect(getEntry).toHaveBeenCalledWith(id);
      expect(remove).toHaveBeenCalledTimes(2);
    });
  });

  describe('getEntryAndSet', () => {
    it('should exec set', () => {
      const set = jest.fn();
      const getEntry = jest.fn().mockReturnValue({
        set,
      });

      new Commander().getEntryAndSet.call({ getEntry }, 1, {
        value: 1,
      });

      expect(getEntry).toHaveBeenCalledWith(1);
      expect(set).toHaveBeenCalledWith({
        value: 1,
      });
    });
  });

  describe('reorderEntries', () => {
    it('should shift array', () => {
      const id = mongoose.Types.ObjectId();
      const id2 = mongoose.Types.ObjectId();
      const id3 = mongoose.Types.ObjectId();

      const output = new Commander().reorderEntries.call(
        {
          entries: [
            {
              label: 'foo',
              folderId: id,
              _id: id2,
            },
            {
              label: 'bar',
              folderId: null,
              folder: true,
              _id: id,
            },
            {
              label: 'quuz',
              folderId: null,
              _id: id3,
            },
          ],
        },
        {
          entries: [
            {
              folderId: null,
              id,
            },
            {
              folderId: id,
              id: id3,
            },
            {
              folderId: id,
              id: id2,
            },
          ],
        },
      );

      expect(output.entries).toEqual([
        {
          label: 'bar',
          folder: true,
          folderId: null,
          _id: id,
        },
        { label: 'quuz', folderId: id, _id: id3 },
        { label: 'foo', folderId: id, _id: id2 },
      ]);
    });
  });
});
