/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();

const { getToken } = require('bambora-node/lib/utils');
const mongoose = require('mongoose');
const Orders = require('q3-schema-orders');
const {
  getAddress,
  getCardDetails,
} = require('../fixtures');

let OrderModel;

const getOrderStub = (rest) =>
  OrderModel.create({
    shipping: getAddress(),
    billing: getAddress(),
    ...rest,
  });

const runBamboraGateway = async (o) =>
  o.pay('Bambora', await getToken(getCardDetails()));

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
  OrderModel = mongoose.model(
    'OrderPaymentStrategyIntegrations',
    Orders,
  );
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Q3 Schema Orders', () => {
  it('should approve transactions under 100', async () => {
    const order = await getOrderStub({ total: 90 });
    const output = await runBamboraGateway(order);
    expect(output).toHaveProperty('status', 'Paid');
    expect(output).toHaveProperty('transactionReceipt');
  });

  it('should decline transactions over 100', async () => {
    const order = await getOrderStub({ total: 110 });
    const output = await runBamboraGateway(order);
    expect(output).toHaveProperty('status', 'Declined');
    expect(output).toHaveProperty('transactionReceipt');
  });
});
