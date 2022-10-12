const makeRows = require('../../lib/makeRows');

describe('makeRows', () => {
  it('should unwind deeply nested arrays', () => {
    const out = makeRows(
      [
        {
          id: 1,
          meta: [1, 2],
          customer: {
            name: 'Hooli',
          },
          products: [
            {
              quantity: 1,
              name: 'FOO',
              components: [
                {
                  name: 'BAR',
                  nested: {
                    discounts: [
                      {
                        value: 90,
                      },
                    ],
                  },
                },
                {
                  name: 'BAZ',
                },
              ],
            },
            {
              name: 'QUUZ',
              components: [
                {
                  name: 'GARPLY',
                },
              ],
            },
          ],
        },
        {
          id: 2,
          customer: {
            name: 'Acme',
          },
          products: [
            {
              quantity: 5,
              name: 'QUUZ',
              components: [
                {
                  name: 'GARPLY',
                },
              ],
            },
            { quantity: 2, name: 'QUUZ' },
          ],
        },
      ],
      [
        { field: 'id' },
        { field: 'customer.name' },
        { field: 'products.name' },
        { field: 'products.quantity' },
        { field: 'products.components.name' },
        {
          field:
            'products.components.nested.discounts.value',
        },
      ],
      {},
    );

    expect(out[0]).toMatchObject({
      id: '1',
      'customer.name': 'Hooli',
      'products.name': 'FOO',
      'products.quantity': '1',
      'products.components.name': 'BAR',
      'products.components.nested.discounts.value': '90',
    });
  });
});
