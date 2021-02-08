const { getFirstTruthySpec } = require('../helpers');

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

  const includesPositionalOperator = () =>
    optional.includes('$[]');

  const includesPositionalOperatorInLastPosition = () =>
    optional.endsWith('$[]');

  const makePosOp = () => {
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
    getReferenceField: () => {
      let key = cleanPath(optional);
      if (!key.endsWith('.')) key += '.';
      key += 'ref';
      return key;
    },

    makeOptional: () => optional,
    makePosOp,

    clean: () => removeTrailing(cleanPath(optional)),

    cleanAndAppendReference: () =>
      attachReference(removeTrailing(cleanPath(optional))),

    traverseUp: () =>
      optional.endsWith('.$[]')
        ? optional.substring(0, optional.length - 4)
        : optional,

    makePosOpFilter: () =>
      getEmbeddedFilterPath(getSinglePath(optional)),

    split: (value) => {
      const [top, bottom] = makePosOp(optional).split(
        '.$[embed].',
      );

      return {
        [top]: {
          [attachReference(bottom)]: value,
        },
      };
    },

    getMatchPath: (context = {}) => {
      const isEmbedded = includesPositionalOperator();
      let param =
        (!isEmbedded && !context.active) || !isEmbedded
          ? attachReference(optional)
          : 'ref';

      if (!includeReferenceField) param = optional;
      return param;
    },

    buildSpecRunner: ({ active }) => {
      const andActive = (a) => a && active;
      const andInactive = (a) => a && !active;

      const isEmbedded = includesPositionalOperator();
      const isEmbeddedPullOp = andInactive(isEmbedded);

      const isEmbeddedUnsetOp =
        isEmbeddedPullOp &&
        !includesPositionalOperatorInLastPosition();

      const isEmbeddedSetOp = andActive(isEmbedded);

      return getFirstTruthySpec({
        isPullOp: andInactive(!isEmbedded),
        isSetOp: andActive(!isEmbedded),
        isEmbeddedSetOp,
        isEmbeddedUnsetOpOnRequiredPath:
          isEmbeddedUnsetOp && str.endsWith('!'),
        isEmbeddedUnsetOp,
        isEmbeddedPullOp,
        isEmbedded,
      });
    },
  };
};
