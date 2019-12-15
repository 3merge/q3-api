const OrderSchema = require('./schema');
const { mergeDuplicateLineItems } = require('./helpers');

OrderSchema.pre('validate', mergeDuplicateLineItems);
module.exports = OrderSchema;
