const {
  PRIVATE_FILES,
  PUBLIC_FILES,
} = require('./constants');

const middlware = (field) => (req, res, next) => {
  Object.assign(req.body, {
    [field]: req.files,
  });

  next();
};

module.exports.assignFilesToPublic = middlware(
  PUBLIC_FILES,
);

module.exports.assignFilesToPrivate = middlware(
  PRIVATE_FILES,
);
