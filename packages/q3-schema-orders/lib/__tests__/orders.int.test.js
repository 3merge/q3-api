const mongoose = require('mongoose');
const OrderSchema = require('..');

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
});

describe('OrderSchema smoke', () => {
  it('should save with items', async () => {
    const Model = mongoose.model('orders', OrderSchema);
    const product = mongoose.Types.ObjectId();
    const order = await Model.create({});

    order.items.push({ product, quantity: 2 });
    order.items.push({ product, quantity: 4 });
    await order.save();
    expect(order.items).toHaveLength(2);
  });
});
