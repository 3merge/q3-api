jest.mock('q3-core-scheduler', () => ({
  __$db: {
    deleteMany: jest.fn(),
  },
}));

const {
  __$db: { deleteMany },
} = require('q3-core-scheduler');
const onQueueCleanup = require('../chores/onQueueCleanup@daily');

describe('onQueueCleanup', () => {
  it('should use env', async () => {
    process.env.QUEUING_LIFETIME = '1_MONTHS';
    await onQueueCleanup();

    expect(deleteMany).toHaveBeenCalledWith({
      due: {
        $lt: expect.any(Object),
      },
    });
  });
});
