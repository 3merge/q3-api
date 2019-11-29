const mung = require('express-mung');
const runRedaction = require('./redact');

exports.request = (req, res, next) => {
  runRedaction(req, req, 'request');
  next();
};

exports.response = mung.json((body, req) => {
  runRedaction(req, body, 'response');
  return body;
});
