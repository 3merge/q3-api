const mongoose = require('mongoose');
const AddressSchema = require('q3-schema-addresses');
const RateSchema = require('q3-schema-rates');
const { STATUS_ENUM, CURRENCY } = require('./constants');

const { Schema } = mongoose;

const price = {
  type: Number,
  private: true,
  systemOnly: true,
  default: 0,
};

RateSchema.add({ quantity: price });

const OrderLineSchema = new Schema(
  {
    bucket: {
      type: Schema.Types.Mixed,
      private: true,
    },
    subtotal: {
      type: Number,
      private: true,
      default: 0,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      ...price,
      private: true,
    },
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
      unique: true,
      sparse: true,
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
      searchable: true,
    },
    shippingOption: String,
    status: {
      type: String,
      default: 'Quote',
      enum: STATUS_ENUM,
    },
    comments: {
      type: String,
      searchable: true,
    },
  },
  {
    timestamps: true,
  },
);

OrderSchema.OrderLineSchema = OrderLineSchema;
module.exports = OrderSchema;
