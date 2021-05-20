const { verify, compose } = require('q3-core-composer');
const jwt = require('jsonwebtoken');

const DocumentationGet = async (req, res) => {
  const {
    FRESHBOOKS_SECRET: secret,
    FRESHBOOKS_ACCOUNT_NAME: name,
    FRESHBOOKS_ACCOUNT_EMAIL: email,
  } = process.env;

  const token = jwt.sign(
    {
      exp: Math.round(Date.now() / 1000) + 7200,
      email,
      name,
    },
    secret,
  );

  res.ok({
    token,
  });
};

DocumentationGet.authorization = [verify];
DocumentationGet.validation = [];

module.exports = compose(DocumentationGet);
