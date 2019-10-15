const {
  check,
  compose,
  redact,
} = require('q3-core-composer');
const { Company } = require('../../models');

const PostCompaniesController = async (
  { body, marshal },
  res,
) => {
  const doc = await Company.create(body);

  res.ok({
    company: marshal(doc),
  });
};

PostCompaniesController.validation = [
  check('name')
    .isString()
    .respondsWith('name'),
  check('incorporatedSince')
    .isISO8601()
    .respondsWith('date'),
];

PostCompaniesController.authorization = [
  redact('q3-api-companies').inResponse('company'),
];

module.exports = compose(PostCompaniesController);
