process.env.WEB_CONCURRENCY = 1;

const seedLocale = require('q3-api/lib/helpers/seedLocale');
const config = require('../config');

(async () => {
  await config.connect();
  await seedLocale(
    'en',
    {
      descriptions: {},
      helpers: {},
      labels: {},
      titles: {},
    },
    {
      applyToAll: true,
    },
  );
})();
