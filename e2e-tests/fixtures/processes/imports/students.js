require('dotenv').config();
const { execChildProcess } = require('q3-api/lib/helpers');
const Q3Instance = require('../../config');

Q3Instance.eventName = 'students-importer';

execChildProcess(
  Q3Instance,
  // eslint-disable-next-line
  async ({ user, query }, trans) => {
    return {
      id: '1',
    };
  },
);
