const middlware = (field) => (req, res, next) => {
  Object.assign(req.body, {
    [field]: req.files,
  });

  next();
};

module.exports.assignFilesToPublic = middlware(
  'publicFiles',
);

module.exports.assignFilesToPrivate = middlware(
  'privateFiles',
);
