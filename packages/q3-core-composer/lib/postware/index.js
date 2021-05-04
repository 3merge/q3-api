const mung = require('express-mung');
const { kill } = require('q3-core-session');
const { isObject } = require('lodash');
const runRedaction = require('./redact');

exports.request = async (req, res, next) => {
  [
    'updatedAt',
    'createdAt',
    'createdBy',
    'lastModifiedBy',
  ].forEach((item) => {
    if (isObject(req.body) && item in req.body)
      delete req.body[item];
  });

  await runRedaction(req, req, 'request');
  next();
};

exports.response = mung.jsonAsync(async (body, req) => {
  await runRedaction(req, body, 'response');

  kill();

  return body;
});
