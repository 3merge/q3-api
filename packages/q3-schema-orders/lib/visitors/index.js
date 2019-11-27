/* eslint-disable func-names */
const OrderVisitor = require('./orderFull');
const OrderItemVisitor = require('./orderItem');

module.exports = (self) => {
  const run = async (data, visitor, options = {}) =>
    visitor.run(data, self, {
      ...self.opts,
      ...options,
    });

  return {
    async onOrderItem() {
      await run(this, new OrderItemVisitor(), {
        siblings: this.parent().items,
      });
    },

    async onOrder() {
      await run(this, new OrderVisitor());
    },
  };
};
