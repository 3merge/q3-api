/* eslint-disable no-param-reassign */
const { ObjectId } = require('mongoose').Types;
const parse = require('q3-core-rest/lib/queryParser');
const { isObject, get } = require('lodash');

const toObjectId = (xs) =>
  String(xs).match(/^[0-9a-fA-F]{24}$/) &&
  ObjectId.isValid(xs)
    ? ObjectId(xs)
    : xs;

module.exports = (data) => {
  const originalUrl = get(data, 'originalUrl', '');
  if (!originalUrl) return data;

  const { query } = parse({
    originalUrl,
  });

  if (!isObject(query)) return data;
  if (query.ids)
    query._id = Array.isArray(query.ids)
      ? query.ids.map(toObjectId)
      : toObjectId(query.ids);
  delete query.ids;
  delete query.template;

  if (isObject(data)) data.query = query;
  else data = { query };
  return data;
};
