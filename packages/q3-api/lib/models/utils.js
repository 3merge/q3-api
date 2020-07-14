/* eslint-disable func-names  */
const { get } = require('lodash');
const path = require('path');

const getId = (user) => get(user, '_id', 'sys');

const getUserPath = (user, fileName) =>
  path
    .join('reports', getId(user), fileName)
    .replace(/\\/g, '/');

module.exports = {
  getId,
  getUserPath,
};
