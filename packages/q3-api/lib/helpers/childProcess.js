const { first, get } = require('lodash');

module.exports = (Q3InsanceConfig, executable) => {
  const connection = Q3InsanceConfig.connect(
    process.env.CONNECTION,
  );

  process.on('message', (args) => {
    // eslint-disable-next-line
    require('dotenv').config();
    // eslint-disable-next-line

    return Promise.all([
      Q3InsanceConfig.$i18.changeLanguage(
        first(get(args, 'user.lang', 'en').split('-')),
      ),
      connection,
    ])
      .then(([t]) => {
        return executable(args, t);
      })

      .then((resp) => {
        process.send(resp);
        return Q3InsanceConfig.$mongoose.close();
      })
      .catch(() => {
        process.exit(0);
      });
  });
};
