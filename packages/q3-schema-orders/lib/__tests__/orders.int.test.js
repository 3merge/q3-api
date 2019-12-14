/* eslint-disable max-classes-per-file, class-methods-use-this, no-console, lines-between-class-members */
const mongoose = require('mongoose');
const iOrderBuilder = require('..');
const { BEST } = require('../constants');

let Model;
let id;

beforeAll(async () => {
  class Order extends iOrderBuilder {
    constructor() {
      super({ discountType: BEST });
    }

    setItemBucket() {
      return Promise.resolve({
        sku: 'MAN_SKU',
        description: 'Desc of product',
      });
    }

    automateItemDiscounts() {
      return [
        {
          factor: 0.12,
          kind: 'Retail',
          global: true,
        },
      ];
    }

    setItemUnmodifiedPrice() {
      return {
        retail: 96.99,
      };
    }

    setTax() {
      return Promise.resolve({
        gst: 5,
        hst: 9,
      });
    }

    setPayment() {
      return Promise.resolve(1.99);
    }

    setLocale() {
      return Promise.resolve(1.36);
    }

    setShipping() {
      return Promise.resolve(11.99);
    }

    automateRebates() {
      return [
        {
          value: 10,
          symbol: '$',
          name: '10$ off',
          description: 'Special promo',
          location: 'Order',
          maximumPerOrder: 1,
        },
      ];
    }
  }

  const Schema = new Order().exec();
  Model = mongoose.model('ORDERS_INTEGRATION', Schema);
  await mongoose.connect(process.env.CONNECTION);
});

describe('OrderSchema', () => {
  it('should create an order with the defaults defined via builder', async () => {
    const doc = await Model.create({});

    id = doc._id;
    expect(doc).toMatchObject({
      status: 'Open',
      draft: false,
      gst: 5,
      hst: 9,
    });
  });

  it('should copy product meta on create', async (done) => {
    const doc = await Model.findById(id);
    doc.items.push({
      product: mongoose.Types.ObjectId(),
      quantity: 11,
    });

    doc.save((e) => {
      expect(e).toBeNull();
      const [item] = doc.items;
      expect(item).toHaveProperty('_id');
      expect(item.unmodifiedPrice).toHaveProperty(
        'retail',
        96.99,
      );

      expect(item).toHaveProperty('subtotal', 128.04);
      expect(item).toHaveProperty('bucket', {
        sku: expect.any(String),
        description: expect.any(String),
      });

      done();
    });
  });

  it('should update totals on save', async (done) => {
    const doc = await Model.findById(id);
    doc.currency = 'CAD';
    doc.globalDiscount = 2;
    doc.shippingOption = 'Express';
    doc.paymentOption = 'Visa';

    doc.billing = {
      streetLine1: '123 Fake Street',
      city: 'Toronto',
      postal: 'M2k0a8',
      phone1: '416-902-1234',
      firstName: 'Mike',
      lastName: 'Foo',
      region: 'ON',
      kind: 'Billing',
      country: 'Canada',
      company: 'Q3'
    };
    
    doc.shipping = {
      streetLine1: '123 Fake Street',
      city: 'Toronto',
      postal: 'M2k0a8',
      phone1: '416-902-1234',
      firstName: 'Mike',
      lastName: 'Foo',
      region: 'ON',
      kind: 'Shipping',
      country: 'Canada',
      company: 'Q3'
    };

    doc.items.push({
      product: mongoose.Types.ObjectId(),
      quantity: 3,
      currency: 'USD',
    });

    doc.save((e) => {
      expect(e).toBeNull();
      expect(doc).toHaveProperty('total', 202.32);
      done();
    });
  });
});
