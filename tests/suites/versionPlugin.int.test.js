/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
const versionPlugin = require('q3-core-version');

mongoose.plugin(versionPlugin, mongoose);
// just like q3-api config
mongoose.set('applyPluginsToChildSchemas', false);

let M;

describe('UserModel integrations', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.CONNECTION);
    M = mongoose.model(
      'versioning',
      new mongoose.Schema({
        stock: Number,
        password: String,
        cost: Number,
        __$q3: mongoose.Schema.Types.Mixed,
        sub: [
          new mongoose.Schema({
            name: String,
          }),
        ],
      }),
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should save previous version', async () => {
    const d = await M.create({
      cost: 1,
      stock: 0,
      password: 'safe',
      sub: [
        {
          name: 'Jon',
        },
      ],
    });

    d.cost = 2;
    d.sub[0].name = 'Alex';
    d.password = 'changed';

    d.set('__$q3', {
      USER: {
        firstName: 'Mike',
      },
    });

    await d.save();

    expect(d.lastModifiedBy).toHaveProperty(
      'firstName',
      'Mike',
    );
  });
});
