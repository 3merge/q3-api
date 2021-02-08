const last = (a) =>
  Array.isArray(a) ? a[a.length - 1] : undefined;

const mergePaths = (s) => String(s).replace(/\./g, '');
const splitByOperator = (s) => String(s).split('$[]');

const getSinglePath = (key) =>
  last(splitByOperator(mergePaths(key)));

const getEmbeddedFilterPath = (path) =>
  ['embed', path, 'ref'].filter(Boolean).join('.');

const cleanPath = (v) => {
  if (typeof v !== 'string')
    throw new Error('Key must be a string');

  return v.replace(/\$\[\]/g, '').replace(/(\.\.)/g, '.');
};

const removeTrailing = (s) =>
  s.endsWith('.') ? s.substring(0, s.length - 1) : s;

module.exports = (path, includeReferenceField) => {
  const str = String(path);
  const optional = str.replace('!', '');

  const attachReference = (v) => {
    let key = String(v);
    if (includeReferenceField) {
      if (!key.endsWith('.')) key += '.';
      key += 'ref';
    }

    return key;
  };

  const makePositionalOperatorIdentifiable = () => {
    const s = optional;

    const n = s.endsWith('$[]')
      ? s.substring(0, s.length - 4)
      : s;

    const pos = s.lastIndexOf('.$[]');
    const formatted =
      pos !== -1
        ? `${n.substring(0, pos)}.$[embed].${n.substring(
            pos + 4,
          )}`
        : n;

    return formatted.endsWith('.')
      ? formatted.substring(0, formatted.length - 1)
      : formatted;
  };

  return {
    getReferenceField: () => attachReference(optional),

    isRequired: () => str.endsWith('!'),
    makeOptional: () => optional,

    makePositionalOperatorIdentifiable,

    normalize: () => removeTrailing(cleanPath(optional)),

    includesPositionalOperator: () =>
      optional.includes('$[]'),
    includesPositionalOperatorInLastPosition: () =>
      optional.endsWith('$[]'),

    removeFinalPositionalOperator: () =>
      optional.endsWith('.$[]')
        ? optional.substring(0, optional.length - 4)
        : optional,

    makeReferenceToIdentifiablePositionalOperator: () =>
      getEmbeddedFilterPath(getSinglePath(optional)),

    shapeIdentifiablePositionalOperator: (value) => {
      const [
        top,
        bottom,
      ] = makePositionalOperatorIdentifiable(
        optional,
      ).split('.$[embed].');

      return {
        [top]: {
          [attachReference(bottom)]: value,
        },
      };
    },
  };
};
