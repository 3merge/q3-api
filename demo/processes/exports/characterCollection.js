require('dotenv').config();

const { Redact } = require('q3-core-access');
const { execChildProcess } = require('q3-api/lib/helpers');
const Q3Instance = require('../../config');
const { Character } = require('../../models');

execChildProcess(Q3Instance, async ({ user }) => {
  const fileName = 'characters.xlsx';
  const characters = await Character.find({})
    .select('name')
    .lean()
    .exec();

  const data = await Redact(characters, user, 'characters');

  const file = await Q3Instance.Notifications.upload(
    {
      name: fileName,

      user,
      data,
    },
    {
      name: 'labels:demo',
    },
  );

  console.log(file);

  return file;
});
