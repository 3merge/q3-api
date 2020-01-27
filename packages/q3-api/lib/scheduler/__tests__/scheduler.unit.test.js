const mongoose = require('../../config/mongoose');
const Emitter = require('../../events/emitter');
const Scheduler = require('..');

const spy = jest.spyOn(Emitter, 'emit');

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Scheduler', () => {
  it.skip('should add new job', async (done) => {
    await Scheduler({
      sleepUntil: new Date(),
    });

    setTimeout(() => {
      expect(spy).toHaveBeenCalled();
      done();
    }, 1000);
  });
});
