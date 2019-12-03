/* eslint-disable class-methods-use-this */
const { setModel } = require('q3-api');
const iOrderBuilder = require('q3-schema-orders');
const ProductModel = require('./products');
const RateModel = require('./rates');

class Order extends iOrderBuilder {
  setItemBucket(id) {
    return ProductModel.findById(id).exec();
  }

  automateItemDiscounts() {
    return [];
  }

  setItemUnmodifiedPrice(v) {
    return v.price;
  }

  async setTax() {
    const { value: hst } = await RateModel.findOne({
      name: 'HST',
    })
      .lean()
      .exec();
    const { value: gst } = await RateModel.findOne({
      name: 'GST',
    })
      .lean()
      .exec();

    return {
      hst,
      gst,
    };
  }

  setPayment() {
    return Promise.resolve(1.99);
  }

  setLocale() {
    return RateModel.findOne({
      name: 'Exchange',
    });
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
Schema.set('restify', '*');
Schema.set('collectionPluralName', 'orders');
Schema.set('collectionSingularName', 'order');

module.exports = setModel('orders', Schema);
