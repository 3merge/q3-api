const mongoose = require('mongoose');
const AddressSchema = require('q3-schema-addresses');
const DiscountSchema = require('q3-schema-discounts');
const RateSchema = require('q3-schema-rates');
const { validateStatus } = require('./helpers');
const { STATUS_ENUM, CURRENCY } = require('./constants');

const { Schema } = mongoose;

const price = {
  type: Number,
  private: true,
  min: 0,
};

RateSchema.add({ quantity: price });

const OrderLineSchema = new Schema({
  bucket: {
    type: Schema.Types.Mixed,
    private: true,
  },
  subtotal: {
    type: Number,
    private: true,
    default: 0,
    min: 0,
  },
  unmodifiedPrice: {
    retail: price,
    discounted: price,
    msrp: price,
    map: price,
    volume: price,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  price: {
    ...price,
    private: true,
  },
  priceOverride: DiscountSchema,
});

const OrderSchema = new Schema(
  {
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
    transaction: {
      type: String,
      private: true,
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
      private: true,
    },
    total: {
      type: Number,
      default: 0,
      min: 0,
      private: true,
    },
    invoice: {
      type: String,
      unique: true,
      sparse: true,
      lock: true,
    },
    belongsTo: {
      type: Schema.Types.ObjectId,
      lock: true,
    },
    onModel: {
      type: String,
    },
    billing: {
      type: AddressSchema,
    },
    shipping: {
      type: AddressSchema,
    },
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
    pst: {
      type: Number,
      default: 0,
    },
    gst: {
      type: Number,
      default: 0,
    },
    hst: {
      type: Number,
      default: 0,
    },
    paymentOption: String,
    shippingOption: String,
    paymentFee: price,
    shippingFee: price,
    tax: price,
    status: {
      type: String,
      default: 'Quote',
      enum: STATUS_ENUM,
      systemOnly: true,
      validate: {
        validator: validateStatus,
      },
    },
    comments: String,
  },
  {
    timestamps: true,
  },
);

OrderSchema.OrderLineSchema = OrderLineSchema;
module.exports = OrderSchema;
