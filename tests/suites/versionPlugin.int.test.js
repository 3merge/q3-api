/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
const versionPlugin = require('q3-core-version');

mongoose.plugin(versionPlugin, mongoose);

let M;

describe('UserModel integrations', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.CONNECTION);
    M = mongoose.model(
      'versioning',
      new mongoose.Schema({
        stock: Number,
        cost: Number,
      }),
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should save previous version', async (done) => {
    const d = await M.create({
      cost: 1,
      stock: 0,
    });

    d.cost = 2;
    await d.save();
    const [{ modified }] = await d.getHistory();
    expect(modified).toHaveProperty('cost', 2);
    done();
  });
});
