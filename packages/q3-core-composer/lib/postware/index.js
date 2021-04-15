const mung = require('express-mung');
const { kill } = require('q3-core-session');
const runRedaction = require('./redact');

exports.request = async (req, res, next) => {
  await runRedaction(req, req, 'request');
  next();
};

exports.response = mung.jsonAsync(async (body, req) => {
  await runRedaction(req, body, 'response');

  kill();

  return body;
});
