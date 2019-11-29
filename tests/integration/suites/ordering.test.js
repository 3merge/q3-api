describe('Q3 guest checkout', () => {
  it('should create an order', async () => {
    process.env.DEBUG = true;
    const { body, status } = await global.agent.post(
      '/orders',
    );

    console.log(body);
  });
});
