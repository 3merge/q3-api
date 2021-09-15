const {
  compose,
  query,
  verify,
} = require('q3-core-composer');
const { exception } = require('q3-core-responder');
const { Grant } = require('q3-core-access');
const micromatch = require('micromatch');
const { filter, isString } = require('lodash');
const mongoose = require('../../config/mongoose');

const includes = (a, b) =>
  a &&
  b &&
  String(a).toUpperCase().includes(String(b).toUpperCase());

const filterByWord = (results = [], search) =>
  results
    .filter((item) => !search || includes(item, search))
    .splice(0, 25);

const SearchParams = async (
  { user, query: { collectionName, field, search } },
  res,
) => {
  const g = new Grant(user)
    .on(collectionName)
    .can('Read')
    .first();

  if (
    !g ||
    !micromatch(field, filter(g.fields, isString)).length
  )
    exception('Authorization')
      .msg('missingReadGrandOnCollection')
      .throw();

  try {
    res.ok({
      values: filterByWord(
        await mongoose
          .model(collectionName)
          .distinct(field)
          .exec(),
        search,
      ),
    });
  } catch (e) {
    res.status(400).send();
  }
};

SearchParams.authorization = [verify];

SearchParams.validation = [
  query('collectionName').isString(),
  query('field').isString(),
];

const Ctrl = compose(SearchParams);

Ctrl.filterByWord = filterByWord;
module.exports = Ctrl;
