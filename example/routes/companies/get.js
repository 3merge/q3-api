const { compose } = require('q3-core-composer');
const { Company } = require('../../models');

const GetCompaniesController = async (
  { marshal, t },
  res,
) => {
  const docs = await Company.find();

  res.ok({
    message: t('labels:accountID'),
    companies: marshal(docs),
  });
};

module.exports = compose(GetCompaniesController);
