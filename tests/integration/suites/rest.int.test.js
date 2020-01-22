const { Publics } = require('../fixtures/models');

const getTotal = async () => {
  const { body } = await global.agent
    .get('/publics')
    .expect(200);

  return body.total;
};

describe('Rest adapter', () => {
  it('should remove inactive documents', async () => {
    await Publics.create({ name: 'Testing' });
    await expect(getTotal()).resolves.toBe(1);
    await Publics.findOneAndDelete({});
    await expect(getTotal()).resolves.toBe(0);
  });
});
