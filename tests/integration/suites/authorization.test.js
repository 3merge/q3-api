describe('Q3 authentication flow', () => {
  it('should require login', () =>
    global.agent.get('/products').expect(403));
});
