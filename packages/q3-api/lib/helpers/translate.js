const { first } = require('lodash');
const i18next = require('i18next');
const session = require('q3-core-session');

const translate = (msg) =>
  i18next.getFixedT(
    first(
      String(session.get('USER', 'lang', 'en'))
        .toLowerCase()
        .split('-'),
    ),
  )(msg);

const joinMsg = (namespace) => (msg) =>
  translate([namespace, msg].join(':'));

exports.from = translate;

exports.errors = joinMsg('errors');
exports.labels = joinMsg('labels');
exports.messages = joinMsg('messages');
