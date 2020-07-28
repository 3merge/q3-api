require('dotenv').config();

const { Redact } = require('q3-core-access');
const { execChildProcess } = require('q3-api/lib/helpers');
const Q3Instance = require('../../config');
const { Character } = require('../../models');

execChildProcess(
  Q3Instance,
  async ({ user, filter }, trans) => {
    const fileName = 'characters.csv';
    const characters = await Character.find(filter)
      .select('name')
      .lean()
      .exec();

    const data = await Redact(
      characters,
      user,
      'characters',
    );

    const file = await Q3Instance.Notifications.upload(
      {
        name: fileName,
        user,
        data,
      },
      {
        $t: trans,
        name: 'labels:demo',
      },
    );

    return file;
  },
);
