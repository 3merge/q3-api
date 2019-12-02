let orderID;
describe('Q3 guest checkout', () => {
  it('should create an order', async () => {
    const { body, status } = await global.agent.post(
      '/orders',
    );

    expect(status).toBe(201);
    expect(body.order).toHaveProperty('status', 'Open');
    ({ id: orderID } = body.order);
  });

  it('should create an order', async () => {
    const { status } = await global.agent
      .post(`/orders/${orderID}/items`)
      .send({
        product: '5de481769127c06214fa0ff2',
        quantity: 2,
      });

    expect(status).toBe(201);
  });
});
