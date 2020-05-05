const Comparison = require('comparisons');
const { exception } = require('q3-core-responder');

const invokeJSON = (v) =>
  v && 'toJSON' in v ? v.toJSON() : v;

const runComparisonEvaluation = (test = [], value) =>
  test.length
    ? value && !new Comparison(test).eval(invokeJSON(value))
    : true;

const filterBy = (propertyName, propertyValue) => (
  grants,
) =>
  grants.filter(
    (grant) => grant[propertyName] === propertyValue,
  );

exports.hasOptions = async (d) => {
  return 'options' in d ? d.options.redact : d.redact;
};

exports.hasFields = ({ fields }) =>
  fields && fields !== '!*';

exports.meetsUserRequirements = (
  { ownershipConditions = [] },
  userInput,
) => {
  if (
    runComparisonEvaluation(ownershipConditions, userInput)
  )
    exception('Authorization')
      .msg('ownershipConditions')
      .throw();
};

exports.meetsDocumentRequirements = (
  { documentConditions = [] },
  doc,
) => {
  if (runComparisonEvaluation(documentConditions, doc))
    exception('Authorization')
      .msg('documentConditions')
      .throw();
};

exports.meetsDocumentRequirements = (
  { documentConditions = [] },
  doc,
) => {
  if (runComparisonEvaluation(documentConditions, doc))
    exception('Authorization')
      .msg('documentConditions')
      .throw();
};

exports.filterByColl = (value) => filterBy('coll', value);

exports.filterByOp = (value) => filterBy('op', value);

exports.filterByRoleType = (value) =>
  filterBy('role', value);
