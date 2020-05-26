jest.mock('node-cron', () => ({
  validate: () => true,
  schedule: jest.fn(),
}));

const mongoose = require('mongoose');
const Scheduler = require('..');

beforeAll(() => {
  mongoose.connect(process.env.CONNECTION);
});

describe('Scheduler', () => {
  it('should add a new scheduler', async () => {
    const doc = await Scheduler.add('newEvent');
    expect(doc._id).toBeDefined();
  });

  it('should update a scheduler', async () => {
    const event = 'toUpdate';
    await Scheduler.add(event, '* * * * *');
    const doc = await Scheduler.update(
      event,
      '*/2 * * * *',
    );

    expect(doc.interval).toMatch('*/2 * * * *');
    expect(doc.running).toBeFalsy();
  });

  it('should delete a scheduler', async () => {
    const event = 'toDelete';
    await Scheduler.add(event);
    await Scheduler.remove(event);
    return expect(
      Scheduler.$model.findOne({ event }).exec(),
    ).resolves.toBeNull();
  });
});
