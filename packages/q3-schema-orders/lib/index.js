/* eslint-disable func-names */
const {
  INTERFACE_REQUIRED_METHODS,
  INTERFACE_RECOMMENDED_METHODS,
} = require('./constants');
const OrderSchema = require('./schema');
const { mergeDuplicateLineItems } = require('./utils/helpers');
const prepareVisitors = require('./visitors');

class iOrderBuilder {
  constructor(args = {}) {
    this.opts = args;

    if (this.$isMissing(INTERFACE_REQUIRED_METHODS))
      throw new Error('Required methods missing');

    if (this.$isMissing(INTERFACE_RECOMMENDED_METHODS))
      /* eslint-disable-next-line */
      console.warn(
        'Recommended methods missing',
      );
  }

  $isMissing(a) {
    return a.filter((name) => !(name in this)).length;
  }

  exec() {
    const { OrderLineSchema } = OrderSchema;
    const { onOrderItem, onOrder } = prepareVisitors(this);

    // pre update
    // pre updateOne
    OrderSchema.pre('validate', mergeDuplicateLineItems);
    OrderLineSchema.pre('save', onOrderItem);
    OrderSchema.pre('save', onOrder);
    return OrderSchema;
  }
}

module.exports = iOrderBuilder;
