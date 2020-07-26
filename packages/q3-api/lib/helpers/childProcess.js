const { first, get } = require('lodash');
const { toQuery } = require('./casters');

module.exports = (Q3InsanceConfig, executable) => {
  const connection = Q3InsanceConfig.connect(
    process.env.CONNECTION,
  );

  process.on('message', (args) => {
    // eslint-disable-next-line
    const session = require('q3-core-session');
    // eslint-disable-next-line
    const { Redact } = require('q3-core-access');

    return Promise.all([
      Q3InsanceConfig.$i18.changeLanguage(
        first(get(args, 'user.lang', 'en').split('-')),
      ),
      connection,
    ])
      .then(([t]) => {
        return new Promise((r) => {
          session.middleware(args, null, () => {
            return executable(
              {
                ...args,
                filter: toQuery(args),
                redact: async (data, collectionname) =>
                  Redact(data, args.user, collectionname),
                t,
              },
              t,
            ).then((res) => {
              r(res);
            });
          });
        });
      })

      .then((resp) => {
        process.send(resp);
        return Q3InsanceConfig.$mongoose.close();
      })
      .catch(() => {
        session.kill();
        process.exit(0);
      });
  });
};
