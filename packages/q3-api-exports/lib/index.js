const Q3 = require('q3-api');
const { Redact } = require('q3-core-access');
const session = require('q3-core-session');
const {
  get,
  size,
  isFunction,
  isObject,
  sortBy,
  isUndefined,
} = require('lodash');
const makeLegend = require('./makeLegend');
const makeRows = require('./makeRows');

module.exports =
  (
    {
      collection,
      sort = 'createdAt',
      extension = 'csv',
      filename = collection,
      columns = [],
      fileOptions = {},
      formatterOptions = {},
      extendQuery = {},
      sortBy: sortByFunction,
      limit = 10000,
    },
    fnMap = {},
  ) =>
  async ({ query, session: { USER: user } }) => {
    session.set('USER', 'user');
    session.set('TENANT', get(user, 'tenant', null));

    const data = await Redact(
      await Q3.model(collection)
        .find(
          isObject(extendQuery)
            ? {
                ...extendQuery,
                ...query,
              }
            : query,
        )
        .limit(limit)
        .collation({ locale: 'en' })
        .sort(sort)
        .lean({ virtuals: true })
        .exec(),
      user,
      collection,
    );

    if (!size(data))
      return Q3.saveToSessionNotifications(
        Q3.utils.translate.messages('nothingToExport'),
      );

    const rows = makeRows(data, columns, {
      customFormatters: fnMap,
      customCache: isFunction(
        get(formatterOptions, 'lookup'),
      )
        ? await formatterOptions.lookup(data)
        : {},
      ...formatterOptions,
    });

    return Q3.saveToSessionDownloads(
      `${filename}.${extension}`,
      {
        data: !isUndefined(sortByFunction)
          ? sortBy(rows, sortByFunction)
          : rows,
        ...fileOptions,
      },
      makeLegend(columns),
    );
  };
