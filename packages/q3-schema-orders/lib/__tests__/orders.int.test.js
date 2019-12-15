const mongoose = require('mongoose');
const OrderSchema = require('..');

let m;

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
  m = mongoose.model('orders', OrderSchema);
});

describe('OrderSchema', () => {
  it('should merge duplicates', async () => {
    const product = mongoose.Types.ObjectId();
    const order = await m.create({});

    order.items.push({ product, quantity: 2 });
    order.items.push({ product, quantity: 4 });
    await order.save();
    expect(order.items).toHaveLength(1);
    expect(order.items[0]).toHaveProperty('quantity', 6);
  });
});
