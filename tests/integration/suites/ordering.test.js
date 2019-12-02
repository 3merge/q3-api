let orderID;

describe('Q3 guest checkout', () => {
  it('should create an order', async () => {
    const { body, status } = await global.agent.post(
      '/orders',
    );

    expect(status).toBe(201);
    expect(body.order).toHaveProperty('status', 'Open');
    ({ id: orderID } = body.order);

    console.log(body.order);
  });

  it('should add an item to the order', async () => {
    const { body, status } = await global.agent
      .post(`/orders/${orderID}/items`)
      .send({
        product: '5de481769127c06214fa0ff2',
        quantity: 2,
      });

    expect(status).toBe(201);
    expect(body.items[0].unmodifiedPrice.retail).toBe(
      129.99,
    );
    expect(body.items[0].subtotal).toBe(259.98);
    expect(body.items[0].bucket).toMatchObject({
      sku: 'Satin Sheets',
    });
  });

  it('should return the order', async () => {
    const { body, status } = await global.agent.get(
      `/orders/${orderID}`,
    );

    expect(status).toBe(200);
    expect(body.order).toHaveProperty('gst', 5);
    expect(body.order).toHaveProperty('hst', 6);
  });
});
