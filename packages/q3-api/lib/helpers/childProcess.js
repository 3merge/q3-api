const { first, get } = require('lodash');
const {
  accept,
  reject,
  finish,
  fail,
} = require('q3-core-mailer/lib/logger');
const { toQuery } = require('./casters');

module.exports = (Q3InsanceConfig, executable) => {
  const log = {
    event: get(Q3InsanceConfig, 'eventName', 'Anonymous'),
  };

  const connection = Q3InsanceConfig.connect(
    process.env.CONNECTION,
  );

  process.on('message', (args) => {
    log.userId = get(args, 'user._id');

    // eslint-disable-next-line
    const session = require('q3-core-session');
    // eslint-disable-next-line
    const { Redact } = require('q3-core-access');

    return Promise.all([
      Q3InsanceConfig.$i18.changeLanguage(
        first(get(args, 'user.lang', 'en').split('-')),
      ),
      connection
        .then(() => accept(log))
        .catch(() => reject(log)),
    ])
      .then(
        ([t]) =>
          new Promise((r) => {
            session.middleware(args, null, () =>
              executable(
                {
                  ...args,
                  filter: toQuery(args),
                  redact: async (data, collectionname) =>
                    Redact(data, args.user, collectionname),
                  t,
                },
                t,
              )
                .then((res) =>
                  finish(log).then(() => {
                    r(res);
                  }),
                )
                .catch(() => fail(log)),
            );
          }),
      )

      .then((resp) => {
        process.send(resp);
        process.exit(1);
      })
      .catch(() => {
        process.exit(0);
      });
  });
};
