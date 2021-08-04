jest.mock('q3-core-session', () => ({
  get: jest.fn().mockReturnValue({
    name: '3merge',
  }),
}));

const { first } = require('lodash');
const mongoose = require('mongoose');
const Schema = require('../../lib');

const Model = mongoose.model('notes', Schema);

const makeDoc = () =>
  Model.create({
    thread: [{ message: 'here' }],
  });

const getNewUpdatedAt = async (xs) => {
  await xs.save();
  return first(xs.thread).updatedAt;
};

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
});

describe('Notes', () => {
  it('should capture session user', async () => {
    const m = await makeDoc();
    expect(first(m.thread).author).toMatch('3merge');
  });

  it('should not update the updatedAt stamp', async () => {
    const m = await makeDoc();
    const { updatedAt } = first(m.thread);
    expect(await getNewUpdatedAt(m)).toEqual(updatedAt);
  });

  it('should update the updatedAt stamp', async () => {
    const m = await makeDoc();
    const thread = first(m.thread);
    const { updatedAt } = thread;
    thread.message = 'Changed';
    expect(await getNewUpdatedAt(m)).not.toBe(updatedAt);
  });
});
