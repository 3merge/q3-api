const {
  get,
  set,
  pick,
  uniq,
  isObject,
} = require('lodash');
const flat = require('flat');
const { model } = require('mongoose');
const { pushUniquely, setPrefix } = require('./helpers');

const BSON_TYPE = '._bsontype';

const getCollectionName = (m) =>
  get(m, 'collection.collectionName');

const isolateSelectStatements = (a) =>
  typeof a === 'string'
    ? a
        .split(' ')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const mergeSelectStatements = (a, b) => {
  const out = [...a];
  b.forEach((item) => {
    if (!out.includes(item)) out.push(item);
  });

  return out;
};

const equals = (v) => (i) => {
  try {
    return i.equals(v);
  } catch (e) {
    return i === v;
  }
};

class BatchQueryLoader {
  static invokeJson(doc) {
    // we need to remove mongoose properties and methods before we flatten it (see load method)
    // otherwise we'll run into callstack errors
    return 'toJSON' in doc ? doc.toJSON() : doc;
  }

  static isEmbeddedPath(pathname, objectKeyName) {
    // will match against flattened array keys and dot-notation
    // i.e. simple.path or simple.0.path
    const re = pathname.replace(/\./gi, '(\\.\\d+\\.|\\.)');

    // when flattened, the _id object unwinds
    // we've selected the BSON path to match against for simplicity
    return new RegExp(`^${re}(${BSON_TYPE})?$`).test(
      objectKeyName,
    );
  }

  constructor(schema) {
    const paths = [];

    const getPaths = (s, p) =>
      s.eachPath(
        (pathname, { options, schema: embedded }) => {
          if (embedded) getPaths(embedded, pathname);

          if (options.autopopulate) {
            pushUniquely(paths, {
              path: setPrefix(p, pathname),
              model: model(options.ref),
              select: options.autopopulateSelect,
            });
          }
        },
      );

    getPaths(schema);

    if (schema.discriminators)
      Object.values(schema.discriminators).forEach(
        getPaths,
      );

    this.$__datasources = paths
      .flat()
      .reduce((acc, { select, path, model: source }) => {
        const name = getCollectionName(source);
        const projection = isolateSelectStatements(select);

        if (name && !acc[name]) {
          acc[name] = {
            ids: [],
            cache: [],
            path: [path],
            projection,
            source,
          };
        } else if (acc[name]) {
          acc[name].path = acc[name].path.concat(path);
          acc[name].projection = mergeSelectStatements(
            acc[name].projection,
            projection,
          );
        }

        return acc;
      }, {});

    return this;
  }

  get isReady() {
    return Object.keys(this.$__datasources).length > 0;
  }

  async fetch() {
    return Promise.all(
      Object.entries(this.$__datasources).map(
        // each source will lookup all unique ids
        async ([key, { source, projection, ids }]) => {
          if (ids && ids.length) {
            const res = await source
              .find({ _id: ids, active: true })
              .setOptions({ skipAutocomplete: true })
              .select(projection)
              .exec();

            // store it so we can assign back to the documents
            this.$__datasources[key].cache = res;
          }
        },
      ),
    );
  }

  load(doc, onDocKey) {
    if (!doc) return this;

    const flattened = Object.keys(
      flat(this.constructor.invokeJson(doc)),
    );

    Object.entries(this.$__datasources).forEach(
      ([Key, { path, ...rest }]) => {
        path.forEach((p) => {
          flattened
            .reduce(
              (acc, next) =>
                this.constructor.isEmbeddedPath(p, next)
                  ? // drop the bson key ending so that we can use the reference
                    // later with mongoose
                    acc.concat(next.replace(BSON_TYPE, ''))
                  : acc,
              [],
            )
            .forEach((matchedKey) => {
              onDocKey(
                get(doc, matchedKey),
                matchedKey,
                Key,
                rest,
              );
            });
        });
      },
    );

    return this;
  }

  registerIds(doc) {
    return this.load(doc, (val, pathKey, sourceKey) => {
      const PATH_TO_IDS = `$__datasources[${sourceKey}].ids`;

      if (
        val &&
        !get(this, PATH_TO_IDS, []).some(equals(val))
      )
        // ensures that we're only adding each ID once
        this.$__datasources[sourceKey].ids.push(val);
    });
  }

  assign(doc) {
    return this.load(
      doc,
      (
        val,
        pathKey,
        sourceKey,
        { source: Source, cache, projection },
      ) => {
        const modifiedProjection = uniq(
          ['_id', 'id'].concat(projection),
        );

        const match = cache.find((d) =>
          d._id && d._id.equals
            ? d._id.equals(val)
            : d._id === val,
        );

        const hasProjectedKey = (xs) =>
          isObject(xs) &&
          modifiedProjection
            .filter((item) => !item.includes('id'))
            .some((item) => item in xs)
            ? pick(xs, modifiedProjection)
            : xs;

        if (match) {
          const populated = Source.hydrate(match);
          const setOnDoc = (xs) => set(doc, pathKey, xs);

          if (doc.schema) {
            const s = doc.schema.path(
              pathKey.replace(/\.\d\./gi, '.'),
            );

            if (s) s.get(hasProjectedKey);
            setOnDoc(populated);
          } else {
            setOnDoc(pick(populated, modifiedProjection));
          }
        }
      },
    );
  }
}

module.exports = BatchQueryLoader;
