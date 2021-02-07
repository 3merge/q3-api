const get = require('lodash.get');

const isObject = (v) => typeof v === 'object' && v !== null;

const getPath = (v) =>
  isObject(v) && 'path' in v ? v.path : null;

const isEmbedded = (m) => m.name === 'EmbeddedDocument';

const reduceByChildSchema = (curr, { schema, model }) => {
  const { path } = model;
  const key = isEmbedded(model) ? `${path}.$` : path;

  return Object.assign(curr, {
    [key]: Object.keys(schema.paths),
  });
};

const hasSyncOption = ({ schema }) =>
  Boolean(get(schema, 'options.sync'));

const cleanPath = (v) => {
  if (typeof v !== 'string')
    throw new Error('Key must be a string');

  return v.replace(/\$/g, '').replace(/(\.\.)/g, '.');
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

exports.findSyncOptions = (model) => {
  const exec = (sch, workingPath = '') => {
    const children = get(sch, 'childSchemas', []);

    const out = children
      .filter(hasSyncOption)
      .reduce(reduceByChildSchema, {});

    children.forEach((c) => {
      if (isEmbedded(c.model))
        Object.assign(
          out,
          exec(c.schema, `${c.model.path}.$.`),
        );
    });

    return Object.entries(out).reduce((acc, [k, v]) => {
      acc[`${workingPath}${k}`] = v;
      return acc;
    }, {});
  };

  return exec(get(model, 'schema'));
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
