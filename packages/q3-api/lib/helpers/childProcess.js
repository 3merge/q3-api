const i18next = require('i18next');
const { get } = require('lodash');

module.exports = (Q3InsanceConfig, executable) => {
  const connection = Q3InsanceConfig.$mongoose.connect(
    process.env.CONNECTION,
  );

  process.on('close', () => {
    connection.close();
  });

  process.on('message', (args) => {
    // eslint-disable-next-line
    require('dotenv').config();
    // eslint-disable-next-line

    return Promise.all([
      i18next.changeLanguage(get(args, 'user.lang', 'en')),
      connection,
    ])
      .then(([t]) => {
        return executable(args, t);
      })
      .then((resp) => {
        process.send(resp);
      });
  });
};
