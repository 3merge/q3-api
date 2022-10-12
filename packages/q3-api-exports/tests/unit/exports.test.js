const Q3 = require('q3-api');
const session = require('q3-core-session');
const mongoose = require('mongoose');
const eg = require('../../lib');

let downloads;

beforeAll(() => {
  mongoose.model(
    'products',
    new mongoose.Schema({
      sku: String,
      quantity: Number,
    }),
  );

  jest.spyOn(session, 'get').mockReturnValue({});
  jest.spyOn(session, 'set').mockReturnValue({});

  downloads = jest
    .spyOn(Q3, 'saveToSessionDownloads')
    .mockResolvedValue();
});

test('should merge query', async () => {
  jest
    .spyOn(mongoose.Query.prototype, 'exec')
    // eslint-disable-next-line
    .mockImplementation(function () {
      expect(this.getQuery()).toMatchObject({
        foo: 1,
        bar: 1,
      });

      return [
        {
          sku: 'ABC',
        },
      ];
    });

  await eg({
    collection: 'products',
    columns: [{ field: 'sku' }],
    extendQuery: {
      foo: 1,
    },
  })({
    query: {
      bar: 1,
    },
    session: {
      USER: {},
    },
  });
});

test('should sort post-DB results', async () => {
  jest
    .spyOn(mongoose.Query.prototype, 'exec')
    .mockImplementation(() => [
      {
        sku: 'ABC',
        quantity: 14,
      },
      {
        sku: 'DEF',
        quantity: 1,
      },
      {
        sku: 'ABC',
        quantity: 12,
      },
    ]);

  await eg({
    collection: 'products',
    columns: [
      { field: 'sku' },
      { field: 'quantity', formatter: 'number' },
    ],
    sortBy: ['sku', 'quantity'],
  })({
    query: {},
    session: {
      USER: {},
    },
  });

  expect(downloads).toHaveBeenCalledWith(
    'products.csv',
    {
      data: [
        {
          sku: 'ABC',
          quantity: 12,
        },
        {
          sku: 'ABC',
          quantity: 14,
        },
        {
          sku: 'DEF',
          quantity: 1,
        },
      ],
    },
    expect.any(Object),
  );
});
