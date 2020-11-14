const { compose, query } = require('q3-core-composer');
const { Grant, Redact } = require('q3-core-access');
const { executeOnAsync } = require('q3-schema-utils');
const mongoose = require('../../config/mongoose');

const isNotEmpty = (v) =>
  typeof v === 'object' && Object.keys(v).length > 0;

const clean = (v) =>
  (Array.isArray(v) ? v : [v]).filter(isNotEmpty);

const getName = (model) =>
  model?.collection?.collectionName;

const getResourceName = (model) =>
  model?.collection?.opts?.schemaUserProvidedOptions
    ?.collectionPluralName;

const getQuickSearchSearchSelectPreferences = (model) =>
  model?.collection?.opts?.schemaUserProvidedOptions
    ?.quicksearch;

const getQuery = (model, searchTerm) =>
  Object.assign(model.searchBuilder(searchTerm), {
    active: true,
  });

const getQuickSearchModels = (user) =>
  Object.values(mongoose.models).filter(
    (model) =>
      getQuickSearchSearchSelectPreferences(model) &&
      new Grant(user)
        .on(getName(model))
        .can('Read')
        .first(),
  );

const redactSearchResultsByCollection = async (
  docs,
  ...rest
) => {
  const out = await executeOnAsync(docs, (doc) =>
    Redact(JSON.parse(JSON.stringify(doc)), ...rest),
  );

  return clean(out);
};

const QuickSearchGetController = async (
  { t, user, query: { query: searchTerm } },
  res,
) => {
  const models = getQuickSearchModels(user);
  const queries = models.map(async (model) => {
    const docs = await model
      .find(getQuery(model, searchTerm))
      .limit(8)
      .exec();

    return redactSearchResultsByCollection(
      docs,
      user,
      getName(model),
    );
  });

  const collectionResults = await Promise.all(queries);
  const results = collectionResults.reduce(
    (acc, curr, i) => {
      const name = getResourceName(models[i]);

      return Object.assign(acc, {
        [name]: curr.map((item) => ({
          id: item._id,
          title: t(`labels:${name}.title`, item),
          description: t(
            `labels:${name}.description`,
            item,
          ),
          photo: item.photo,
        })),
      });
    },
    {},
  );

  res.ok({
    results,
  });
};

QuickSearchGetController.validation = [
  query('query').isString(),
];

module.exports = compose(QuickSearchGetController);
