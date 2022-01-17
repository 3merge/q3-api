const mongoose = require('mongoose');
const { AccessControl } = require('q3-core-access');
const session = require('q3-core-session');
const ChangelogReport = require('../../lib/report');

const id = mongoose.Types.ObjectId();

const generateDataResults = (output) => {
  AccessControl.init([
    {
      role: 'DEVELOPER',
      coll: 'foo',
      fields: ['foo', 'bar', 'quuz', 'thunk'],
      op: 'Read',
    },
  ]);

  const report = new ChangelogReport('foo', id);

  jest.spyOn(report, 'connection', 'get').mockReturnValue({
    aggregate: jest.fn().mockReturnValue({
      toArray: jest.fn().mockReturnValue(output),
    }),
  });

  return report.getData({}, [
    'foo',
    'bar',
    'quuz',
    'thunk',
    // not included in access above
    'garple',
  ]);
};

beforeAll(() => {
  jest.spyOn(session, 'get').mockReturnValue({
    role: 'DEVELOPER',
  });
});

describe('ChangelogReport', () => {
  describe('getDistinctUsers', () => {
    it('should return empty when disallowed', async () => {
      AccessControl.init([]);
      const report = new ChangelogReport('foo', id);
      const results = await report.getDistinctUsers();
      expect(results).toHaveLength(0);
    });

    it('should return results', async () => {
      AccessControl.init([
        {
          role: 'DEVELOPER',
          coll: 'q3-api-users',
          fields: ['name'],
          op: 'Read',
        },
      ]);

      const report = new ChangelogReport('foo', id);

      jest
        .spyOn(report, 'connection', 'get')
        .mockReturnValue({
          aggregate: jest.fn().mockReturnValue({
            toArray: jest.fn().mockReturnValue([
              {
                id: 1,
                name: 'Jon',
              },
              {
                id: 2,
                name: 'Jane',
              },
            ]),
          }),
        });

      const results = await report.getDistinctUsers();
      expect(results).toHaveLength(2);
    });
  });

  describe('getData', () => {
    it('should return empty', async () => {
      AccessControl.init([]);
      const report = new ChangelogReport('foo', id);
      const results = await report.getData();
      expect(results).toHaveLength(0);
    });

    it('should negate duplicate additions and deletions', async () => {
      expect(
        await generateDataResults([
          {
            additions: [
              {
                foo: '1',
              },
            ],
            deletions: [
              {
                foo: '1',
              },
            ],
          },
        ]),
      ).toHaveLength(0);
    });

    it('should redact', async () => {
      expect(
        await generateDataResults([
          {
            additions: [
              {
                foo: 1,
                bar: 1,
                // not seen
                garply: 1,
              },
            ],
            deletions: [
              {
                foo: 1,
              },
            ],
          },
        ]),
      ).toEqual([
        {
          additions: [
            {
              foo: 1,
              bar: 1,
            },
          ],
          deletions: [
            {
              foo: 1,
            },
          ],
        },
      ]);
    });

    it('should negate duplicate additions and updates', async () => {
      expect(
        await generateDataResults([
          {
            additions: [
              {
                foo: '1',
              },
            ],
            updates: [
              {
                curr: {
                  foo: '1',
                },
              },
            ],
          },
        ]),
      ).toEqual([
        {
          updates: [
            {
              foo: '1',
            },
          ],
        },
      ]);
    });
  });

  describe('$internals.convertStringToArray', () => {
    it('should split', () => {
      expect(
        ChangelogReport.$internals.convertStringToArray(
          '1,2',
        ),
      ).toEqual(['1', '2']);
    });

    it('should remain array', () => {
      expect(
        ChangelogReport.$internals.convertStringToArray([
          '1',
        ]),
      ).toEqual(['1']);
    });
  });

  describe('$internals.castPathsToQueryForExistence', () => {
    it('should return three conditions per path', () => {
      const a =
        ChangelogReport.$internals.castPathsToQueryForExistence(
          ['foo', 'bar'],
        );

      expect(a).toHaveLength(6);
      expect(a[0]).toMatchObject({
        'added.foo': {
          $exists: true,
        },
      });
    });
  });

  describe('$internals.getIndexKey', () => {
    it('should return as-is', () => {
      const a =
        ChangelogReport.$internals.getIndexKey('foo');

      expect(a).toMatch('foo');
    });

    it('should modify', () => {
      const a = ChangelogReport.$internals.getIndexKey(
        'foo',
        () => 'BAR',
      );

      expect(a).toMatch('BAR');
    });

    it('should remove array indices', () => {
      const a = ChangelogReport.$internals.getIndexKey(
        'flattened.name.0.split.1.into.0.parts',
      );

      expect(a).toMatch(
        'flattened.name.split.into.parts #1-2-1',
      );
    });

    it('should remove array indices and modify', () => {
      const a = ChangelogReport.$internals.getIndexKey(
        'flattened.name.0',
        (v) => String(v).toUpperCase(),
      );

      expect(a).toMatch('FLATTENED.NAME');
    });
  });

  describe('$internals.reduceFlattenedObject', () => {
    it('should', () => {
      const a =
        ChangelogReport.$internals.reduceFlattenedObject(
          {
            'foo.bar': 1,
            'baz.0.testing.0': 1,
            'baz.0.testing.1': 1,
          },
          (v) => String(v).toUpperCase(),
        );

      expect(a).toEqual({
        'BAZ.TESTING #1-1': 1,
        'BAZ.TESTING #1-2': 1,
        'FOO.BAR': 1,
      });
    });
  });
});
