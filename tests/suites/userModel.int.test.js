/* eslint-disable import/no-extraneous-dependencies */
const UserSchema = require('q3-schema-users');
const { on } = require('q3-core-mailer');
const mongoose = require('mongoose');
const { getUserBase } = require('../fixtures');

let M;

describe('UserModel integrations', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.CONNECTION);
    M = mongoose.model('UserTestModel', UserSchema);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should dispatch an event', async (done) => {
    on('onNewUser', (args) => {
      expect(args).toHaveProperty('email');
      done();
    });

    await M.create(getUserBase());
  });
});
