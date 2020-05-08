const Comparison = require('comparisons');

const invokeJSON = (v) =>
  v && 'toJSON' in v ? v.toJSON() : v;

const runComparisonEvaluation = (test = [], value) =>
  test.length
    ? value && new Comparison(test).eval(invokeJSON(value))
    : true;

const filterBy = (propertyName, propertyValue) => (
  grants,
) => {
  return grants.filter((grant) => {
    if (!grant[propertyName]) return false;

    try {
      return grant[propertyName].test(propertyValue);
    } catch (e) {
      return (
        String(grant[propertyName]).toLowerCase() ===
        String(propertyValue).toLowerCase()
      );
    }
  });
};
exports.hasOptions = (d) =>
  'options' in d ? d.options.redact : d.redact;

exports.hasFields = ({ fields }) =>
  fields && !fields.includes('!*');

exports.extractUser = (ctx) => {
  try {
    return ctx.__$q3.USER;
  } catch (e) {
    return null;
  }
};

const getPluralizedCollectionName = (n) =>
  new RegExp(
    `^${
      n.charAt(n.length - 1) === 's'
        ? n.substring(0, n.length - 1)
        : n
    }+(s?)$`,
    'i',
  );

exports.meetsUserRequirements = (
  { ownershipConditions = [] },
  userInput,
) =>
  runComparisonEvaluation(ownershipConditions, userInput);

exports.meetsDocumentRequirements = (
  { documentConditions = [] },
  doc,
) => runComparisonEvaluation(documentConditions, doc);

exports.filterByColl = (a, value) =>
  filterBy(
    'coll',
    value,
  )(
    a.map((v) => ({
      ...v,
      coll: getPluralizedCollectionName(v.coll),
    })),
  );

exports.filterByOp = (a, value) => filterBy('op', value)(a);

exports.filterByRoleType = (a, value) =>
  filterBy('role', value)(a);
