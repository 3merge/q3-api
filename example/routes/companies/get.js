const { compose } = require('q3-core-composer');
const { Company } = require('../../models');

const GetCompaniesController = async ({ marshal }, res) => {
  const docs = await Company.find();

  res.ok({
    companies: marshal(docs),
  });
};

module.exports = compose(GetCompaniesController);
