const mung = require('express-mung');
const { kill } = require('q3-core-session');
const runRedaction = require('./redact');

exports.request = (req, res, next) => {
  runRedaction(req, req, 'request');
  next();
};

exports.response = mung.json((body, req) => {
  runRedaction(req, body, 'response');
  kill();

  return body;
});
