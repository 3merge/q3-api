require('dotenv').config();

const { execChildProcess } = require('q3-api/lib/helpers');
const Q3Instance = require('../../config');

execChildProcess(Q3Instance, async ({ user }) => {
  return Q3Instance.Notifications.create({
    userId: user._id,
    label: 'New characters have been uploaded',
  });
});
