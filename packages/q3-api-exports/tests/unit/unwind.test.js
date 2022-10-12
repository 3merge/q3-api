const { findIndex, isEqual } = require('lodash');
const flat = require('flat');
const unwind = require('../../lib/unwind');

const stub = unwind({
  seq: 1,
  customer: {
    firstName: 'Mike',
  },
  address: {
    city: 'Toronto',
  },
  items: [
    {
      stock: {
        available: 1,
      },
      sku: 'Shoe',
      price: 69.49,
      accessories: [
        {
          name: 'Polish',
          price: 6.19,
        },
        {
          name: 'Lace',
          price: 3.99,
        },
      ],
    },
    {
      stock: {
        available: 3,
      },
      sku: 'Shirt',
      price: 39.99,
      accessories: [
        {
          name: 'Buttons',
          price: 1.99,
          specials: [
            {
              name: 'Buy 1 Get 1',
            },
            {
              name: 'Limited Time',
            },
          ],
        },
      ],
    },
  ],
});

test.each([
  [
    {
      seq: 1,
      customer: {
        firstName: 'Mike',
      },
      address: {
        city: 'Toronto',
      },
      items: {
        stock: {
          available: 1,
        },
        sku: 'Shoe',
        price: 69.49,
        accessories: {
          name: 'Polish',
          price: 6.19,
        },
      },
    },
  ],
  [
    {
      seq: 1,
      customer: {
        firstName: 'Mike',
      },
      address: {
        city: 'Toronto',
      },
      items: {
        stock: {
          available: 1,
        },
        sku: 'Shoe',
        price: 69.49,
        accessories: {
          name: 'Lace',
          price: 3.99,
        },
      },
    },
  ],
  [
    {
      seq: 1,
      customer: {
        firstName: 'Mike',
      },
      address: {
        city: 'Toronto',
      },
      items: {
        stock: {
          available: 3,
        },
        sku: 'Shirt',
        price: 39.99,
        accessories: {
          name: 'Buttons',
          price: 1.99,
          specials: {
            name: 'Buy 1 Get 1',
          },
        },
      },
    },
  ],
  [
    {
      seq: 1,
      customer: {
        firstName: 'Mike',
      },
      address: {
        city: 'Toronto',
      },
      items: {
        stock: {
          available: 3,
        },
        sku: 'Shirt',
        price: 39.99,
        accessories: {
          name: 'Buttons',
          price: 1.99,
          specials: {
            name: 'Limited Time',
          },
        },
      },
    },
  ],
])('.unwind()', (a) => {
  expect(
    findIndex(stub, (item) => isEqual(item, flat(a))),
  ).not.toBe(-1);
});
