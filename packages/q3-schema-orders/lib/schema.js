const mongoose = require('mongoose');
const AddressSchema = require('q3-schema-addresses');
const RateSchema = require('q3-schema-rates').clone();
const { STATUS_ENUM, CURRENCY } = require('./constants');

const { Schema } = mongoose;

const price = {
  type: Number,
  private: true,
  systemOnly: true,
  default: 0,
};

RateSchema.add({
  quantity: price,
});

RateSchema.path('name', {
  ...RateSchema.obj.name,
  searchable: false,
  gram: false,
});

const OrderLineSchema = new Schema(
  {
    bucket: {
      type: Schema.Types.Mixed,
      systemOnly: true,
      private: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    subtotal: price,
    price,
  },
  {
    disableOwnership: true,
  },
);

const OrderSchema = new Schema(
  {
    tax: price,
    paymentFee: price,
    shippingFee: price,
    subtotal: price,
    total: price,
    draft: {
      type: Boolean,
      default: false,
    },
    items: [OrderLineSchema],
    fees: {
      type: [RateSchema],
      private: true,
      systemOnly: true,
    },
    po: String,
    transactionReceipt: Schema.Types.Mixed,
    invoice: {
      type: String,
      searchable: true,
      gram: true,
      lock: true,
    },
    billing: AddressSchema,
    shipping: AddressSchema,
    rate: {
      type: Number,
      private: true,
      default: 1,
    },
    currency: {
      type: String,
      enum: CURRENCY,
      private: true,
      lock: true,
    },
    paymentOption: {
      type: String,
    },
    shippingOption: String,
    status: {
      type: String,
      default: 'Quote',
      enum: STATUS_ENUM,
    },
    comments: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

OrderSchema.OrderLineSchema = OrderLineSchema;
module.exports = OrderSchema;
