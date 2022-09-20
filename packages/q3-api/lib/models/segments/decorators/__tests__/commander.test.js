const Commander = require('../commander');

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
});
