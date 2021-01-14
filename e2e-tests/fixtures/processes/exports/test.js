require('dotenv').config();
const { execChildProcess } = require('q3-api/lib/helpers');
const Q3Instance = require('../../config');

execChildProcess(Q3Instance, async () => {
  // send file back to server
  console.log('done/');
  return null;
});
