const get = require('lodash.get');
const ModelProxy = require('./ModelProxy');

const isObject = (v) => typeof v === 'object' && v !== null;

const getPath = (v) =>
  isObject(v) && 'path' in v ? v.path : null;

const cleanPath = (v) => {
  if (typeof v !== 'string')
    throw new Error('Key must be a string');

  return v.replace(/\$\[\]/g, '').replace(/(\.\.)/g, '.');
};

exports.isDefined = (v) =>
  v !== null && v !== undefined && v !== '';

exports.setPrefix = (p, name) =>
  `${
    typeof p === 'string' && p.length ? `${p}.` : ''
  }${name}`;

exports.pushUniquely = (a, i) =>
  a.filter(Boolean).findIndex((item) => {
    const inbound = getPath(item);
    const target = getPath(i);
    return inbound === target || !inbound || !target;
  }) === -1
    ? a.push(i)
    : 0;

exports.getSync = (v) =>
  get(v, 'schema.options.sync', null);

exports.getSyncPaths = (v) =>
  Object.keys(get(v, 'schema.paths', {})).filter(
    (name) => !['ref', '_id', '__v'].includes(name),
  );

exports.getPreSync = (v) =>
  get(v, 'schema.options.preSync', null);

exports.removeTrailing = (s) =>
  s.endsWith('.') ? s.substring(0, s.length - 1) : s;

exports.appendRef = (v) => {
  let key = cleanPath(v);
  if (!key.endsWith('.')) key += '.';
  key += 'ref';

  return key;
};

exports.filterByPrivateProps = ([key, v]) => [
  key,
  Array.isArray(v)
    ? v.filter(
        (val) =>
          ![
            '_id',
            'ref',
            'updatedAt',
            'createdAt',
            'createdBy',
            'ngrams',
          ].includes(val),
      )
    : v,
];

exports.reduceByContext = (ctx, key) => (a, next) =>
  !ctx
    ? a
    : Object.assign(a, {
        [`${key}.${next}`]: ctx[next],
      });

exports.cleanPath = cleanPath;

exports.forEachCollectionAsync = (
  collections,
  collectionsNameResolver,
) => async (fn) =>
  Promise.allSettled(
    collections.map((collection) =>
      fn(
        new ModelProxy(collection, collectionsNameResolver),
      ),
    ),
  );

// eslint-disable-next-line
exports.markModifiedLocalVars = function () {
  this.$locals.wasNew = this.isNew;
  this.$locals.wasModifiedPaths = this.modifiedPaths();
};

// eslint-disable-next-line
exports.executeMiddlewareOnUpdate = (next) => {
  return !this.$locals || !this.$locals.wasNew
    ? function preserverThisContext() {
        return next.call(this);
      }
    : () => {
        // noop
      };
};
