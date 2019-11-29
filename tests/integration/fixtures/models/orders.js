const { setModel } = require('q3-api');
const iOrderBuilder = require('q3-schema-orders');
const ProductModel = require('./products');

class Order extends iOrderBuilder {
  setItemBucket(id) {
    return ProductModel.findStrictly(id);
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
module.exports = setModel('orders', Schema);
