describe('Q3 authentication flow', () => {
  it('should require login', () =>
    global.agent.get('/products').expect(403));

  it('should require login', () =>
    global.agent.get('/rates').expect(403));
});
