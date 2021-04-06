/* eslint-disable no-param-reassign */

const { models, Types } = require('mongoose');
const parse = require('q3-core-rest/lib/queryParser');
const { isObject, get } = require('lodash');

const { ObjectId } = Types;

const toObjectId = (xs) =>
  String(xs).match(/^[0-9a-fA-F]{24}$/) &&
  ObjectId.isValid(xs)
    ? ObjectId(xs)
    : xs;

module.exports = (data) => {
  const datasource = get(models, get(data, 'datasource'));
  const originalUrl = get(data, 'originalUrl', '');

  if (!originalUrl) return data;
  const { query } = parse({ originalUrl }, datasource);

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
