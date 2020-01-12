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
  systemOnly: true,
  default: 0,
};

RateSchema.add({ quantity: price });

const OrderLineSchema = new Schema({
  priceOverride: DiscountSchema,
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
});

const OrderSchema = new Schema(
  {
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
    transaction: {
      type: String,
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
