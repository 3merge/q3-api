const fs = require('fs');
const path = require('path');

const registerGlobals = (location) => {
  const globals = path.join(location, './globals.js');
  const expectedGlobalFunctions = [
    'getMailerVars',
    'getWebApp',
    'getUrl',
  ];

  if (!fs.existsSync(globals)) return;

  // eslint-disable-next-line
  Object.entries(require(globals)).forEach(([key, fn]) => {
    if (expectedGlobalFunctions.includes(key))
      global[key] = fn;
  });
};

module.exports = registerGlobals;
