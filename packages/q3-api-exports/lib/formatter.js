const { get, isNil, invoke } = require('lodash');
const moment = require('moment-timezone');
const session = require('q3-core-session');

module.exports = (unformatted, formatter = 'string') => {
  const tz = () =>
    get(session.get('USER'), 'timezone', 'America/Toronto');

  const exec = (xs) =>
    invoke(
      {
        boolean() {
          return typeof xs === 'boolean'
            ? xs
            : xs === 'true';
        },

        date() {
          const m = moment(xs, moment.ISO_8601);
          return m.isValid()
            ? m.tz(tz()).format('YYYY-MM-DD')
            : '';
        },

        datetime() {
          const m = moment(xs, moment.ISO_8601);
          return m.isValid()
            ? m.tz(tz()).format('LLL')
            : '';
        },

        number() {
          const num = Number(xs);
          return !Number.isNaN(num) ? num : 0;
        },

        price() {
          return `$${Number(this.number()).toFixed(2)}`;
        },

        string() {
          const str = String(xs);
          return !isNil(xs) &&
            !['null', 'undefined', 'false', '0'].includes(
              str,
            )
            ? str
            : '';
        },
      },
      formatter,
    );

  return Array.isArray(unformatted)
    ? unformatted.map(exec).join(', ')
    : exec(unformatted);
};
