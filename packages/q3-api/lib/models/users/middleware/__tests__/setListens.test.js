const Domain = require('../../../domains');
const {
  populateDefaultListenOptions,
} = require('../setListens');

jest
  .spyOn(Domain.Query.prototype, 'exec')
  .mockResolvedValue({
    listens: {
      Developer: ['foo', 'bar'],
    },
  });

describe('populateDefaultListenOptions', () => {
  it('should copy listen options by role type', async () => {
    const context = {
      isNew: true,
      role: 'Developer',
    };

    await populateDefaultListenOptions.call(context);
    expect(context).toHaveProperty('listens', [
      'foo',
      'bar',
    ]);
  });
});
