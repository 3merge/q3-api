require('dotenv').config();

const { Redact } = require('q3-core-access');
const { execChildProcess } = require('q3-api/lib/helpers');
const Q3Instance = require('../../config');
const { Character } = require('../../models');

execChildProcess(
  Q3Instance,
  async ({ user, query }, trans) => {
    const fileName = 'characters.xlsx';
    const characters = await Character.find(query)
      .select('name')
      .lean()
      .exec();

    const data = await Redact(
      characters,
      user,
      'characters',
    );

    const mapped = Q3Instance.Reports.mapHeaders(
      data,
      {
        name: 'labels:demo',
      },
      trans,
    );

    return Q3Instance.Reports.uploadAndReturnRecent(
      fileName,
      mapped,
      user,
    );
  },
);
