const mongoose = require('mongoose');
const AddressSchema = require('q3-schema-addresses');
const DiscountSchema = require('q3-schema-discounts');
const RebateSchema = require('q3-schema-rebates');
const RateSchema = require('q3-schema-rates');
const { validateStatus } = require('./utils/helpers');
const { STATUS_ENUM, CURRENCY } = require('./constants');

const { Schema } = mongoose;

const price = {
  type: Number,
  private: true,
  min: 0,
};

RateSchema.add({ quantity: price });
RebateSchema.add({
  applicableTo: {
    type: [Schema.Types.Mixed],
    private: true,
  },
});

const OrderLineSchema = new Schema({
  priceOverride: DiscountSchema,
  via: {
    type: Schema.Types.Mixed,
    private: true,
  },
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
  currency: {
    type: String,
    enum: CURRENCY,
    default: CURRENCY[0],
    private: true,
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
  discounts: {
    type: [DiscountSchema],
    private: true,
  },
  price: {
    ...price,
    private: true,
  },
});

const OrderSchema = new Schema(
  {
    draft: {
      type: Boolean,
      default: false,
    },
    rebateCodes: {
      type: [String],
    },
    globalDiscount: {
      type: Number,
      max: 100,
      min: 0,
    },
    rebates: {
      type: [RebateSchema],
      private: true,
    },
    items: [OrderLineSchema],
    fees: {
      type: [RateSchema],
      private: true,
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
      default: 'Open',
      enum: STATUS_ENUM,
      validate: {
        validator: validateStatus,
      },
    },
  },
  {
    timestamps: true,
  },
);

OrderSchema.OrderLineSchema = OrderLineSchema;
module.exports = OrderSchema;
