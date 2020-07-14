require('dotenv').config();

const { execChildProcess } = require('q3-api/lib/helpers');
const Q3Instance = require('../../config');

execChildProcess(
  Q3Instance,
  async ({ user, query }, trans) => {
    // send file back to server
    return {
      id: '1',
    };
  },
);
